"use client";

import { getMapRestaurants, getRestaurantRoute } from "@/lib/api/maps/API";
import type { RestaurantRouteResponse } from "@/lib/api/maps/type";
import { showErrorToast } from "@/lib/app-toast";
import { useEffect, useMemo, useState } from "react";
import type {
  AmenityKey,
  MapRestaurant,
} from "./map-data";
import { currentLocation as fallbackLocation } from "./map-data";
import {
  distanceLimitMeters,
  distanceOptionForMeters,
  formatDistanceShort,
  getBrowserCurrentLocation,
  type BrowserLocation,
} from "./map-routing";
import { MapFilterSidebar, type MapFilterState } from "./MapFilterSidebar";
import { MapSearchResults } from "./MapSearchResults";
import type { AppliedFilter, SortOption } from "./SearchResultsHeader";

const initialFilters: MapFilterState = {
  keyword: "",
  distance: "1.0km",
  quality: {
    hygiene: false,
    japaneseStaff: false,
    japaneseMenu: false,
  },
  cuisines: [],
  amenities: {
    vat: false,
    parking: false,
    privateRoom: false,
  },
};

const qualityLabels: Record<keyof MapFilterState["quality"], string> = {
  hygiene: "日本基準認証店のみ",
  japaneseStaff: "日本人スタッフ常駐",
  japaneseMenu: "日本語メニュー完備",
};

const amenityLabels: Record<AmenityKey, string> = {
  vat: "VAT発行可",
  parking: "駐車場あり",
  privateRoom: "個室完備",
};

function isValidKeyword(value: string) {
  return value.length <= 255 && /^[\p{L}\p{N}\sー・.,、。-]*$/u.test(value);
}

type RouteMap = Record<number, RestaurantRouteResponse>;

export function UserMapView() {
  const [filters, setFilters] = useState<MapFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<MapRestaurant | null>(null);
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<BrowserLocation | null>(null);
  const [routes, setRoutes] = useState<RouteMap>({});
  const [completedRouteKey, setCompletedRouteKey] = useState("");
  const isMapOpen = selectedRestaurant !== null;
  const routeRequestKey = useMemo(() => {
    if (!currentLocation || restaurants.length === 0) {
      return "";
    }

    return `${currentLocation.point.lat},${currentLocation.point.lng}:${restaurants
      .map((restaurant) => restaurant.id)
      .join(",")}`;
  }, [currentLocation, restaurants]);
  const isRouteLoading =
    currentLocation === null ||
    (routeRequestKey !== "" && completedRouteKey !== routeRequestKey);

  useEffect(() => {
    let cancelled = false;

    getMapRestaurants()
      .then((data) => {
        if (!cancelled) setRestaurants(data);
      })
      .catch((error) => {
        if (!cancelled) showErrorToast("Failed to load restaurants: " + error.message);
      });

    getBrowserCurrentLocation()
      .then((location) => {
        if (cancelled) {
          return;
        }

        setCurrentLocation(location);
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }

        setCurrentLocation({
          point: fallbackLocation,
          accuracyMeters: Number.POSITIVE_INFINITY,
          capturedAt: Date.now(),
        });
        setRoutes({});
        showErrorToast(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentLocation || routeRequestKey === "") {
      return;
    }

    let cancelled = false;

    Promise.allSettled(
      restaurants.map((restaurant) =>
        getRestaurantRoute(restaurant.id, currentLocation.point).then(
          (route) => [restaurant.id, route] as const,
        ),
      ),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextRoutes: RouteMap = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const [restaurantId, route] = result.value;
          nextRoutes[restaurantId] = route;
        }
      });

      setRoutes(nextRoutes);
      setCompletedRouteKey(routeRequestKey);
    });

    return () => {
      cancelled = true;
    };
  }, [currentLocation, restaurants, routeRequestKey]);

  const appliedFilters = useMemo<AppliedFilter[]>(() => {
    const items: AppliedFilter[] = [
      { key: "distance", label: `${filters.distance}以内` },
    ];

    Object.entries(filters.quality).forEach(([key, value]) => {
      if (value) {
        items.push({
          key: `quality:${key}`,
          label: qualityLabels[key as keyof MapFilterState["quality"]],
        });
      }
    });

    filters.cuisines.forEach((cuisine) => {
      items.push({ key: `cuisine:${cuisine}`, label: cuisine });
    });

    Object.entries(filters.amenities).forEach(([key, value]) => {
      if (value) {
        items.push({
          key: `amenity:${key}`,
          label: amenityLabels[key as AmenityKey],
        });
      }
    });

    return items;
  }, [filters]);

  const routedRestaurants = useMemo<MapRestaurant[]>(
    () =>
      restaurants.map((restaurant) => {
        const route = routes[restaurant.id];
        const routeOrigin = currentLocation?.point;

        if (
          !route ||
          !routeOrigin ||
          route.origin.lat !== routeOrigin.lat ||
          route.origin.lng !== routeOrigin.lng
        ) {
          return restaurant;
        }

        return {
          ...restaurant,
          distance: formatDistanceShort(route.distanceMeters),
          distanceValue:
            distanceOptionForMeters(route.distanceMeters) ??
            restaurant.distanceValue,
          routeDistanceMeters: route.distanceMeters,
          routeDurationSeconds: route.durationSeconds,
        };
      }),
    [currentLocation, routes, restaurants],
  );

  const filteredRestaurants = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const selectedDistanceLimit = distanceLimitMeters(filters.distance);

    const nextRestaurants = routedRestaurants.filter((restaurant) => {
      if (keyword && !restaurant.name.toLowerCase().includes(keyword)) {
        return false;
      }

      if (
        restaurant.routeDistanceMeters === undefined ||
        restaurant.routeDistanceMeters > selectedDistanceLimit
      ) {
        return false;
      }

      if (filters.quality.hygiene && !restaurant.isVerified) {
        return false;
      }

      if (filters.quality.japaneseStaff && !restaurant.hasJapaneseStaff) {
        return false;
      }

      if (filters.quality.japaneseMenu && !restaurant.hasJapaneseMenu) {
        return false;
      }

      if (
        filters.cuisines.length > 0 &&
        !filters.cuisines.includes(restaurant.cuisine)
      ) {
        return false;
      }

      return Object.entries(filters.amenities).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return restaurant.amenities.includes(key as AmenityKey);
      });
    });

    return [...nextRestaurants].sort((a, b) => {
      if (sort === "rating") {
        return b.ratingValue - a.ratingValue;
      }

      if (sort === "distance") {
        return (
          (a.routeDistanceMeters ?? Number.POSITIVE_INFINITY) -
          (b.routeDistanceMeters ?? Number.POSITIVE_INFINITY)
        );
      }

      return Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
    });
  }, [filters, routedRestaurants, sort]);

  function handleKeywordBlur() {
    if (isValidKeyword(filters.keyword)) {
      return;
    }

    showErrorToast("入力形式が正しくありません。再度入力してください");
    setFilters((current) => ({ ...current, keyword: "" }));
  }

  function handleRemoveFilter(key: string) {
    if (key === "distance") {
      setFilters((current) => ({ ...current, distance: "5km" }));
      return;
    }

    const [type, value] = key.split(":");

    if (type === "quality") {
      setFilters((current) => ({
        ...current,
        quality: {
          ...current.quality,
          [value]: false,
        },
      }));
      return;
    }

    if (type === "cuisine") {
      setFilters((current) => ({
        ...current,
        cuisines: current.cuisines.filter((cuisine) => cuisine !== value),
      }));
      return;
    }

    if (type === "amenity") {
      setFilters((current) => ({
        ...current,
        amenities: {
          ...current.amenities,
          [value]: false,
        },
      }));
    }
  }

  const filterSidebar = (
    <MapFilterSidebar
      filters={filters}
      onAmenityToggle={(key) =>
        setFilters((current) => ({
          ...current,
          amenities: {
            ...current.amenities,
            [key]: !current.amenities[key],
          },
        }))
      }
      onCuisineToggle={(value) =>
        setFilters((current) => ({
          ...current,
          cuisines: current.cuisines.includes(value)
            ? current.cuisines.filter((cuisine) => cuisine !== value)
            : [...current.cuisines, value],
        }))
      }
      onDistanceChange={(value) =>
        setFilters((current) => ({ ...current, distance: value }))
      }
      onKeywordBlur={handleKeywordBlur}
      onKeywordChange={(value) =>
        setFilters((current) => ({ ...current, keyword: value }))
      }
      onQualityToggle={(key) =>
        setFilters((current) => ({
          ...current,
          quality: {
            ...current.quality,
            [key]: !current.quality[key],
          },
        }))
      }
    />
  );

  if (isMapOpen) {
    return (
      <div className="mx-auto flex h-[calc(100vh-80px)] min-h-0 w-full max-w-[1280px] flex-col overflow-hidden bg-[#f4f4f1] lg:flex-row lg:items-start">
        {filterSidebar}
        <MapSearchResults
          appliedFilters={appliedFilters}
          isMapOpen={isMapOpen}
          origin={currentLocation?.point ?? null}
          isRouteLoading={isRouteLoading}
          restaurants={filteredRestaurants}
          routes={routes}
          selectedRestaurant={selectedRestaurant}
          sort={sort}
          onCloseMap={() => setSelectedRestaurant(null)}
          onOpenMap={setSelectedRestaurant}
          onRemoveFilter={handleRemoveFilter}
          onSortChange={setSort}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start lg:gap-8">
      {filterSidebar}
      <MapSearchResults
        appliedFilters={appliedFilters}
        isMapOpen={isMapOpen}
        origin={currentLocation?.point ?? null}
        isRouteLoading={isRouteLoading}
        restaurants={filteredRestaurants}
        routes={routes}
        selectedRestaurant={selectedRestaurant}
        sort={sort}
        onCloseMap={() => setSelectedRestaurant(null)}
        onOpenMap={setSelectedRestaurant}
        onRemoveFilter={handleRemoveFilter}
        onSortChange={setSort}
      />
    </div>
  );
}