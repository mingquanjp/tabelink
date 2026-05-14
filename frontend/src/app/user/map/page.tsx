import { MapFilterSidebar, MapSearchResults } from "@/components/user/map";

export default function UserMapPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-[#f4f4f1] lg:flex-row">
      <MapFilterSidebar />
      <MapSearchResults />
    </div>
  );
}
