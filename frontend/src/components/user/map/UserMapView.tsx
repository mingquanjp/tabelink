"use client";

import { useMemo, useState } from "react";
import { showErrorToast } from "@/lib/app-toast";
import { MapFilterSidebar, type MapFilterState } from "./MapFilterSidebar";
import { MapSearchResults } from "./MapSearchResults";
import {
  restaurants as mockRestaurants,
  type AmenityKey,
  type DistanceOption,
  type MapRestaurant,
} from "./map-data";
import type { AppliedFilter, SortOption } from "./SearchResultsHeader";

const initialFilters: MapFilterState = {
  keyword: "",
  distance: "1.0km",
  quality: {
    hygiene: true,
    japaneseStaff: false,
    japaneseMenu: false,
  },
  cuisines: [],
  amenities: {
    vat: true,
    parking: true,
    privateRoom: true,
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

function distanceRank(value: DistanceOption) {
  if (value === "500m") {
    return 0;
  }

  if (value === "1.0km") {
    return 1;
  }

  return 2;
}

export function UserMapView() {
  const [filters, setFilters] = useState<MapFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<MapRestaurant | null>(null);
  const isMapOpen = selectedRestaurant !== null;

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

  const filteredRestaurants = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const selectedDistanceRank = distanceRank(filters.distance);

    const nextRestaurants = mockRestaurants.filter((restaurant) => {
      if (keyword && !restaurant.name.toLowerCase().includes(keyword)) {
        return false;
      }

      if (distanceRank(restaurant.distanceValue) > selectedDistanceRank) {
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
        return distanceRank(a.distanceValue) - distanceRank(b.distanceValue);
      }

      return Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
    });
  }, [filters, sort]);

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
          restaurants={filteredRestaurants}
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
        restaurants={filteredRestaurants}
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
