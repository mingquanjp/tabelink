"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Minus, Navigation, Plus, X } from "lucide-react";
import { currentLocation, type MapRestaurant } from "./map-data";

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type Point = {
  x: number;
  y: number;
};

type OsrmRouteResponse = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

type MapAreaProps = {
  restaurant: MapRestaurant;
  onClose: () => void;
};

const TILE_SIZE = 256;
const MIN_ZOOM = 11;
const MAX_ZOOM = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function latLngToWorld(point: LatLngLiteral, zoom: number): Point {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = clamp(Math.sin((point.lat * Math.PI) / 180), -0.9999, 0.9999);

  return {
    x: ((point.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function getWrappedTileX(x: number, zoom: number) {
  const tileCount = 2 ** zoom;
  return ((x % tileCount) + tileCount) % tileCount;
}

function formatRouteInfo(distanceMeters?: number, durationSeconds?: number) {
  if (!distanceMeters || !durationSeconds) {
    return "ルート情報を取得できません";
  }

  const distance =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(distanceMeters)}m`;
  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  return `${distance} / 約${minutes}分`;
}

function getFitZoom(
  origin: LatLngLiteral,
  destination: LatLngLiteral,
  width: number,
  height: number,
) {
  if (width <= 0 || height <= 0) {
    return 13;
  }

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const originPoint = latLngToWorld(origin, zoom);
    const destinationPoint = latLngToWorld(destination, zoom);
    const deltaX = Math.abs(destinationPoint.x - originPoint.x);
    const deltaY = Math.abs(destinationPoint.y - originPoint.y);

    if (deltaX <= width * 0.62 && deltaY <= height * 0.62) {
      return zoom;
    }
  }

  return MIN_ZOOM;
}

function getBrowserCurrentLocation() {
  return new Promise<LatLngLiteral>((resolve) => {
    if (!navigator.geolocation) {
      resolve(currentLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(currentLocation),
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 5_000,
      },
    );
  });
}

async function fetchRoute(origin: LatLngLiteral, destination: LatLngLiteral) {
  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
  });
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("OSRM route request failed.");
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    throw new Error("OSRM route is empty.");
  }

  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    info: formatRouteInfo(route.distance, route.duration),
  };
}

export function MapArea({ restaurant, onClose }: MapAreaProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [origin, setOrigin] = useState<LatLngLiteral>(currentLocation);
  const [routeResult, setRouteResult] = useState<{
    key: string;
    coordinates: LatLngLiteral[];
    info: string;
  } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoomDelta, setZoomDelta] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getBrowserCurrentLocation().then((location) => {
      if (!cancelled) {
        setOrigin(location);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  const fitZoom = useMemo(
    () => getFitZoom(origin, restaurant.position, size.width, size.height),
    [origin, restaurant.position, size],
  );
  const zoom = clamp(fitZoom + zoomDelta, MIN_ZOOM, MAX_ZOOM);
  const routeKey = `${origin.lat},${origin.lng}-${restaurant.position.lat},${restaurant.position.lng}`;
  const activeRouteCoordinates = useMemo(
    () => (routeResult?.key === routeKey ? routeResult.coordinates : []),
    [routeResult, routeKey],
  );
  const routeInfo =
    routeResult?.key === routeKey ? routeResult.info : "ルートを計算中";

  useEffect(() => {
    let cancelled = false;

    fetchRoute(origin, restaurant.position)
      .then((route) => {
        if (cancelled) {
          return;
        }

        setRouteResult({
          key: routeKey,
          coordinates: route.coordinates,
          info: route.info,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setRouteResult({
          key: routeKey,
          coordinates: [origin, restaurant.position],
          info: "ルート情報を取得できません",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [origin, restaurant.position, routeKey]);

  const projected = useMemo(() => {
    const originPoint = latLngToWorld(origin, zoom);
    const destinationPoint = latLngToWorld(restaurant.position, zoom);
    const center = {
      x: (originPoint.x + destinationPoint.x) / 2,
      y: (originPoint.y + destinationPoint.y) / 2,
    };
    const topLeft = {
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
    };

    return {
      destination: {
        x: destinationPoint.x - topLeft.x,
        y: destinationPoint.y - topLeft.y,
      },
      origin: {
        x: originPoint.x - topLeft.x,
        y: originPoint.y - topLeft.y,
      },
      path: activeRouteCoordinates.map((coordinate) => {
        const point = latLngToWorld(coordinate, zoom);
        return {
          x: point.x - topLeft.x,
          y: point.y - topLeft.y,
        };
      }),
      topLeft,
    };
  }, [origin, restaurant.position, activeRouteCoordinates, size, zoom]);

  const tiles = useMemo(() => {
    if (size.width === 0 || size.height === 0) {
      return [];
    }

    const startX = Math.floor(projected.topLeft.x / TILE_SIZE);
    const endX = Math.floor((projected.topLeft.x + size.width) / TILE_SIZE);
    const startY = Math.floor(projected.topLeft.y / TILE_SIZE);
    const endY = Math.floor((projected.topLeft.y + size.height) / TILE_SIZE);
    const tileCount = 2 ** zoom;
    const nextTiles: Array<{
      key: string;
      left: number;
      top: number;
      url: string;
    }> = [];

    for (let x = startX; x <= endX; x += 1) {
      for (let y = startY; y <= endY; y += 1) {
        if (y < 0 || y >= tileCount) {
          continue;
        }

        nextTiles.push({
          key: `${zoom}-${x}-${y}`,
          left: x * TILE_SIZE - projected.topLeft.x,
          top: y * TILE_SIZE - projected.topLeft.y,
          url: `https://tile.openstreetmap.org/${zoom}/${getWrappedTileX(x, zoom)}/${y}.png`,
        });
      }
    }

    return nextTiles;
  }, [projected.topLeft, size, zoom]);

  const routePath = projected.path
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <section
      ref={containerRef}
      className="relative h-full min-h-0 flex-1 overflow-hidden bg-[#e2e3e0]"
      onWheel={(event) => event.preventDefault()}
    >
      <div className="absolute inset-0">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            alt=""
            className="absolute size-64 select-none"
            draggable={false}
            src={tile.url}
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        role="presentation"
      >
        {routePath ? (
          <path
            d={routePath}
            fill="none"
            stroke="#d32f2f"
            strokeDasharray="9 8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
        ) : null}
      </svg>

      <div
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: projected.destination.x, top: projected.destination.y }}
      >
        <div className="rounded bg-[#d32f2f] px-3 py-2 font-jp text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
          {restaurant.mapName}
        </div>
        <div className="flex size-12 items-center justify-center rounded-xl border-4 border-white bg-[#d32f2f] font-jp text-xl font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
          49
        </div>
      </div>

      <div
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: projected.origin.x, top: projected.origin.y }}
      >
        <div className="rounded-full bg-[#2563eb] px-3 py-1 font-jp text-[10px] font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
          現在地
        </div>
        <div className="size-7 rounded-full border-4 border-white bg-[#2563eb] shadow-[0_8px_18px_rgba(0,0,0,0.18)]" />
      </div>

      <button
        type="button"
        className="absolute right-8 top-8 z-20 flex items-center gap-2 rounded-xl border border-[rgba(228,190,186,0.3)] bg-white/90 px-[17px] py-[9px] font-jp text-[12px] font-medium leading-4 text-[#5a6053] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] backdrop-blur"
        onClick={onClose}
      >
        <X className="size-3.5" />
        マップを閉じる
      </button>

      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex size-12 items-center justify-center rounded-lg bg-white text-[#1a1c1b] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          onClick={() =>
            setZoomDelta((value) =>
              clamp(fitZoom + value + 1, MIN_ZOOM, MAX_ZOOM) - fitZoom,
            )
          }
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex size-12 items-center justify-center rounded-lg bg-white text-[#1a1c1b] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          onClick={() =>
            setZoomDelta((value) =>
              clamp(fitZoom + value - 1, MIN_ZOOM, MAX_ZOOM) - fitZoom,
            )
          }
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Back to current location"
          className="flex size-12 items-center justify-center rounded-lg bg-[#d32f2f] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          onClick={() => setZoomDelta(0)}
        >
          <LocateFixed className="size-5" />
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-20 rounded-xl bg-white/90 px-4 py-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] backdrop-blur">
        <div className="flex items-center gap-2 font-jp text-[12px] font-medium text-[#5a6053]">
          <Navigation className="size-4 text-[#d32f2f]" />
          {routeInfo}
        </div>
      </div>
    </section>
  );
}
