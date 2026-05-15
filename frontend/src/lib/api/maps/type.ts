export type LatLng = {
  lat: number;
  lng: number;
};

export type RestaurantRouteResponse = {
  restaurantId: number;
  origin: LatLng;
  destination: LatLng & {
    nameVn: string;
    nameJp: string;
    address: string;
  };
  provider: "osrm";
  distanceMeters: number;
  durationSeconds: number;
  geometry: LatLng[];
};
