import { apiRequest } from "../client";
import { AdvancedSearchParams, AdvancedSearchResponse } from "./type";

export async function advancedSearchRestaurants(params: AdvancedSearchParams) {
  const urlParams = new URLSearchParams();

  if (params.keyword) urlParams.append("keyword", params.keyword);
  if (params.lat) urlParams.append("lat", String(params.lat));
  if (params.lng) urlParams.append("lng", String(params.lng));
  if (params.radius) urlParams.append("radius", String(params.radius));
  if (params.page) urlParams.append("page", String(params.page));
  if (params.limit) urlParams.append("limit", String(params.limit));

  if (params.issuesVAT !== undefined) {
    urlParams.append("issuesVAT", String(params.issuesVAT));
  }

  params.japaneseStandards?.forEach((id) =>
    urlParams.append("japaneseStandards", String(id)),
  );
  params.dishTypes?.forEach((id) => urlParams.append("dishTypes", String(id)));
  params.services?.forEach((id) => urlParams.append("services", String(id)));

  const data = await apiRequest<AdvancedSearchResponse>(
    `/restaurants/advanced-search?${urlParams.toString()}`,
    { auth: false },
  );

  return data;
}
