import type { DistanceOption } from "./map-data";

export type LatLngLiteral = {
  lat: number;
  lng: number;
};

export type BrowserLocation = {
  point: LatLngLiteral;
  accuracyMeters: number;
  capturedAt: number;
};

const TARGET_GPS_ACCURACY_METERS = 100;
const LOCATION_TIMEOUT_MS = 6_000;
const LOCATION_SETTLE_MS = 2_000;
const GEOLOCATION_PERMISSION_DENIED = 1;

export function isValidLatLng(point: LatLngLiteral) {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

export function distanceLimitMeters(option: DistanceOption) {
  if (option === "500m") {
    return 500;
  }

  if (option === "1.0km") {
    return 1000;
  }

  return 5000;
}

export function distanceOptionForMeters(distanceMeters: number): DistanceOption | null {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return null;
  }

  if (distanceMeters <= 500) {
    return "500m";
  }

  if (distanceMeters <= 1000) {
    return "1.0km";
  }

  if (distanceMeters <= 5000) {
    return "5km";
  }

  return null;
}

export function formatDistanceShort(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return "";
  }

  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)}km`
    : `${Math.round(distanceMeters)}m`;
}

function toBrowserLocation(position: GeolocationPosition): BrowserLocation | null {
  const point = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  if (!isValidLatLng(point)) {
    return null;
  }

  return {
    point,
    accuracyMeters: Number.isFinite(position.coords.accuracy)
      ? Math.max(0, position.coords.accuracy)
      : Number.POSITIVE_INFINITY,
    capturedAt: position.timestamp,
  };
}

export function getBrowserCurrentLocation() {
  return new Promise<BrowserLocation>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Browser geolocation is not available."));
      return;
    }

    let settled = false;
    let bestLocation: BrowserLocation | null = null;
    let lastError: GeolocationPositionError | null = null;
    let watchId: number | null = null;
    let settleTimeoutId: number | null = null;

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: LOCATION_TIMEOUT_MS,
    } satisfies PositionOptions;

    function finishWithLocation(location: BrowserLocation) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(location);
    }

    function finishWithError(message: string) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(new Error(message));
    }

    function handlePosition(position: GeolocationPosition) {
      const location = toBrowserLocation(position);

      if (!location) {
        return;
      }

      if (
        !bestLocation ||
        location.accuracyMeters < bestLocation.accuracyMeters
      ) {
        bestLocation = location;
      }

      if (location.accuracyMeters <= TARGET_GPS_ACCURACY_METERS) {
        finishWithLocation(location);
        return;
      }

      if (settleTimeoutId === null) {
        settleTimeoutId = window.setTimeout(() => {
          if (bestLocation) {
            finishWithLocation(bestLocation);
          }
        }, LOCATION_SETTLE_MS);
      }
    }

    function handleError(error: GeolocationPositionError) {
      lastError = error;

      if (error.code === GEOLOCATION_PERMISSION_DENIED) {
        finishWithError("Location permission was denied.");
      }
    }

    const timeoutId = window.setTimeout(() => {
      if (bestLocation) {
        finishWithLocation(bestLocation);
        return;
      }

      finishWithError(
        lastError?.message || "Could not get the current location.",
      );
    }, LOCATION_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeoutId);

      if (settleTimeoutId !== null) {
        window.clearTimeout(settleTimeoutId);
      }

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    }

    watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      options,
    );
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      options,
    );
  });
}
