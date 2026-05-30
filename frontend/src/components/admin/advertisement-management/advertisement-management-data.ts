export type AdvertisementStatus = "Pending" | "Active" | "Scheduled" | "Rejected";

export type AdvertisementRequest = {
  id: number;
  restaurantName: string;
  campaignName: string;
  period: string;
  periodLabel: string;
  impressions: string;
  ctr: string;
  status: AdvertisementStatus;
  imageUrl: string;
  rejectionReason?: string;
};

export const initialAdvertisementRequests: AdvertisementRequest[] = [
  {
    id: 1,
    restaurantName: "銀座 鮨 きずな",
    campaignName: "「春の特別おまかせコース」プロモーション",
    period: "2024.04.01 - 2024.04.30",
    periodLabel: "30日間",
    impressions: "-",
    ctr: "-",
    status: "Pending",
    imageUrl: "https://www.figma.com/api/mcp/asset/73929fe9-ff7e-4c26-9a94-c8acf8a7a587",
  },
  {
    id: 2,
    restaurantName: "麺屋 侍",
    campaignName: "「新規開店記念」10% OFF 広告",
    period: "2024.03.15 - 2024.04.15",
    periodLabel: "掲載中 (残り12日)",
    impressions: "124,500",
    ctr: "4.2%",
    status: "Active",
    imageUrl: "https://www.figma.com/api/mcp/asset/7a5e462e-19d7-4b4f-bddb-4dacd3b119d7",
  },
  {
    id: 3,
    restaurantName: "Bar Noir Hanoi",
    campaignName: "「ハッピーアワー」認知拡大キャンペーン",
    period: "2024.05.01 - 2024.05.31",
    periodLabel: "予約済み",
    impressions: "-",
    ctr: "-",
    status: "Scheduled",
    imageUrl: "https://www.figma.com/api/mcp/asset/46d524b6-2eb8-42fb-8481-7fcdc085396a",
  },
];

export const advertisementManagementSummary = {
  pendingCount: "12",
  activeCount: "45",
  totalImpressions: "1.2M",
  averageCtr: "3.8%",
  totalCount: 57,
};
