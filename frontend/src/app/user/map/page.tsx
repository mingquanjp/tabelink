import { MapFilterSidebar, MapSearchResults } from "@/components/user/map";

export default function UserMapPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f4f4f1]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start lg:gap-8">
        <MapFilterSidebar />
        <MapSearchResults />
      </div>
    </div>
  );
}
