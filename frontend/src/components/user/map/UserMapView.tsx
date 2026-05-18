"use client";

import { advancedSearchRestaurants } from "@/lib/api/maps/API";
import type { AdvancedSearchParams } from "@/lib/api/maps/restaurant-advance-search/type";
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
  type BrowserLocation
} from "./map-routing";
import { MapFilterSidebar, type MapFilterState } from "./MapFilterSidebar";
import { MapSearchResults } from "./MapSearchResults";
import type { AppliedFilter, SortOption } from "./SearchResultsHeader";

const CUISINE_MAP: Record<string, number[]> = {
  "フォー": [1, 4, 7],
  "ブンチャー": [2, 5],
  "シーフード": [3, 6],
  "鍋料理": [1],
  "おまかせ": [7],
};

const FEATURE_IDS = {
  JAPANESE_MENU: 3,
  VAT: 4,
  HYGIENE: -1,
};

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

  const [totalCount, setTotalCount] = useState(0);
  const [completedSearchKey, setCompletedSearchKey] = useState("");

  const [currentLocation, setCurrentLocation] =
    useState<BrowserLocation | null>(null);
  const routes = useMemo<RouteMap>(() => ({}), []);
  const isMapOpen = selectedRestaurant !== null;
  const searchParams = useMemo<AdvancedSearchParams | null>(() => {
    if (!currentLocation) {
      return null;
    }

    const radius = parseFloat(filters.distance) * 1000;
    const dishTypes = filters.cuisines.flatMap((c) => CUISINE_MAP[c] || []);
    const japaneseStandards = [
      filters.quality.hygiene ? FEATURE_IDS.HYGIENE : null,
      filters.quality.japaneseMenu ? FEATURE_IDS.JAPANESE_MENU : null,
    ].filter((v): v is number => v !== null);

    return {
      keyword: filters.keyword || undefined,
      lat: currentLocation.point.lat,
      lng: currentLocation.point.lng,
      radius,
      dishTypes,
      japaneseStandards,
      issuesVAT: filters.amenities.vat || undefined,
      page: 1,
      limit: 50,
    };
  }, [currentLocation, filters]);
  const searchKey = useMemo(
    () => (searchParams ? JSON.stringify(searchParams) : ""),
    [searchParams],
  );
  const isLoading = currentLocation === null || completedSearchKey !== searchKey;
  const isRouteLoading = currentLocation === null;

  useEffect(() => {
    getBrowserCurrentLocation()
      .then(setCurrentLocation)
      .catch((error: Error) => {
        setCurrentLocation({
          point: fallbackLocation,
          accuracyMeters: Number.POSITIVE_INFINITY,
          capturedAt: Date.now(),
        });
        console.error(error);
        showErrorToast("現在地を取得できませんでした");
      });
  }, []);

  useEffect(() => {
    if (!searchParams || searchKey === "") return;
    let cancelled = false;

    advancedSearchRestaurants(searchParams)
      .then((res) => {
        if (cancelled) return;
        setRestaurants(res.items as unknown as MapRestaurant[]);
        setTotalCount(res.totalCount);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) showErrorToast("検索に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setCompletedSearchKey(searchKey);
      });

    return () => { cancelled = true; };
  }, [searchParams, searchKey]);

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
    const selectedDistanceLimit = distanceLimitMeters(filters.distance);

    return [...routedRestaurants].filter((restaurant) => {
      if (restaurant.routeDistanceMeters !== undefined) {
        return restaurant.routeDistanceMeters <= selectedDistanceLimit;
      }
      return true;
    }).sort((a, b) => {
      if (sort === "rating") return b.ratingValue - a.ratingValue;
      if (sort === "distance") {
        return (a.routeDistanceMeters ?? Number.POSITIVE_INFINITY) - (b.routeDistanceMeters ?? Number.POSITIVE_INFINITY);
      }
      return Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
    });
  }, [routedRestaurants, sort, filters.distance]);

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
          totalCount={totalCount}
          isLoading={isLoading}
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
        totalCount={totalCount}
        isLoading={isLoading}
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
