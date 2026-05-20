import { getCampaigns } from "@/lib/api/campaigns/API";
import { CampaignList } from "./CampaignList";

export default async function UserCampaignPage() {
  const data = await getCampaigns();

  return <CampaignList campaigns={data.items} />;
}
