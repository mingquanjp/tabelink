"use client";

import { advancedSearchRestaurants, getRestaurantRoute } from "@/lib/api/maps/API";
import type { RestaurantRouteResponse } from "@/lib/api/maps/type";
import { refreshSession, guestLogin } from "@/lib/api/auth/API";
import { clearAuthSessionCache } from "@/lib/api/auth/session";
import { ApiError } from "@/lib/api/client";
import { showErrorToast } from "@/lib/app-toast";
import { useEffect, useMemo, useState } from "react";
import type {
  AmenityKey,
  MapRestaurant,
} from "./map-data";
import { currentLocation as fallbackLocation, mapApiToMapRestaurant } from "./map-data";
import {
  distanceLimitMeters,
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

const SEARCH_DEBOUNCE_MS = 300;
const ROUTE_DISTANCE_CONCURRENCY = 3;
const PAGE_SIZE = 6;

const initialFilters: MapFilterState = {
  keyword: "",
  distance: "5km",
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
type SearchParams = Parameters<typeof advancedSearchRestaurants>[0];

async function searchRestaurantsWithSessionRetry(params: SearchParams) {
  try {
    return await advancedSearchRestaurants(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        await refreshSession();
      } catch {
        await guestLogin();
      }

      clearAuthSessionCache();
      return advancedSearchRestaurants(params);
    }

    throw error;
  }
}

export function UserMapView() {
  const [filters, setFilters] = useState<MapFilterState>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<MapFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<MapRestaurant | null>(null);
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentLocation, setCurrentLocation] =
    useState<BrowserLocation | null>(null);
  const [completedSearchKey, setCompletedSearchKey] = useState("");
  const [routes, setRoutes] = useState<RouteMap>({});
  const isMapOpen = selectedRestaurant !== null;
  const searchRequestKey = useMemo(() => {
    if (!currentLocation) {
      return "";
    }

    return JSON.stringify({
      filters: debouncedFilters,
      lat: currentLocation.point.lat,
      lng: currentLocation.point.lng,
      page: currentPage,
    });
  }, [currentLocation, debouncedFilters, currentPage]);
  const isSearchLoading =
    currentLocation === null ||
    (searchRequestKey !== "" && completedSearchKey !== searchRequestKey);

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
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    if (!currentLocation || searchRequestKey === "") return;
    let cancelled = false;
    const requestKey = searchRequestKey;
    // Chuyển đổi Filter sang API Params
    const radius = parseFloat(debouncedFilters.distance) * 1000;
    const dishTypes = debouncedFilters.cuisines.flatMap(c => CUISINE_MAP[c] || []);
    const japaneseStandards = [
      debouncedFilters.quality.hygiene ? FEATURE_IDS.HYGIENE : null,
      debouncedFilters.quality.japaneseMenu ? FEATURE_IDS.JAPANESE_MENU : null
    ].filter((v): v is number => v !== null);

    searchRestaurantsWithSessionRetry({
      keyword: debouncedFilters.keyword || undefined,
      lat: currentLocation.point.lat,
      lng: currentLocation.point.lng,
      radius,
      dishTypes,
      japaneseStandards,
      issuesVAT: debouncedFilters.amenities.vat || undefined,
      page: currentPage,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setRestaurants(res.items.map(mapApiToMapRestaurant));
        setTotalCount(res.totalCount);
        setCompletedSearchKey(requestKey);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setCompletedSearchKey(requestKey);
          if (err instanceof ApiError && err.status === 403) {
            showErrorToast("ユーザーまたはゲストとしてログインしてください");
          } else {
            showErrorToast("検索に失敗しました");
          }
        }
      })

    return () => { cancelled = true; };
  }, [currentPage, debouncedFilters, currentLocation, searchRequestKey]);

  useEffect(() => {
    if (restaurants.length === 0 || completedSearchKey !== searchRequestKey) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const pendingRestaurants = restaurants;
    let nextIndex = 0;

    async function runWorker() {
      while (!cancelled) {
        const restaurant = pendingRestaurants[nextIndex];
        nextIndex += 1;

        if (!restaurant) {
          return;
        }

        try {
          const route = await getRestaurantRoute(
            restaurant.id,
            currentLocation.point,
            { signal: controller.signal },
          );

          if (cancelled) {
            return;
          }

          setRoutes((current) => ({ ...current, [restaurant.id]: route }));
        } catch (error) {
          if (!cancelled) {
            console.error(error);
          }
        }
      }
    }

    Array.from(
      { length: Math.min(ROUTE_DISTANCE_CONCURRENCY, pendingRestaurants.length) },
      () => runWorker(),
    );

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [completedSearchKey, currentLocation, restaurants, searchRequestKey]);


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

        if (!route) {
          return restaurant;
        }

        const distance =
          route.distanceMeters >= 1000
            ? `${(route.distanceMeters / 1000).toFixed(1)}km`
            : `${Math.round(route.distanceMeters)}m`;

        return {
          ...restaurant,
          distance,
          routeDistanceMeters: route.distanceMeters,
          routeDurationSeconds: route.durationSeconds,
        };
      }),
    [restaurants, routes],
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
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const visibleRestaurants = isSearchLoading ? [] : filteredRestaurants;
  const visibleTotalCount = isSearchLoading ? 0 : totalCount;

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

  function handlePageChange(page: number) {
    setCurrentPage(page);
    setSelectedRestaurant(null);
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
          totalCount={visibleTotalCount}
          currentPage={currentPage}
          appliedFilters={appliedFilters}
          isMapOpen={isMapOpen}
          origin={currentLocation?.point ?? null}
          isLoading={isSearchLoading}
          totalPages={totalPages}
          restaurants={visibleRestaurants}
          routes={routes}
          selectedRestaurant={selectedRestaurant}
          sort={sort}
          onCloseMap={() => setSelectedRestaurant(null)}
          onOpenMap={setSelectedRestaurant}
          onPageChange={handlePageChange}
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
        totalCount={visibleTotalCount}
        currentPage={currentPage}
        appliedFilters={appliedFilters}
        isMapOpen={isMapOpen}
        origin={currentLocation?.point ?? null}
        isLoading={isSearchLoading}
        totalPages={totalPages}
        restaurants={visibleRestaurants}
        routes={routes}
        selectedRestaurant={selectedRestaurant}
        sort={sort}
        onCloseMap={() => setSelectedRestaurant(null)}
        onOpenMap={setSelectedRestaurant}
        onPageChange={handlePageChange}
        onRemoveFilter={handleRemoveFilter}
        onSortChange={setSort}
      />
    </div>
  );
}
