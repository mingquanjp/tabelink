import { apiRequest } from "@/lib/api/client";
import type {
  ListVerificationBadgesResponse,
  VerificationApplication,
  VerificationUploadResponse,
} from "@/lib/api/verification/type";

export function listVerificationBadges() {
  return apiRequest<ListVerificationBadgesResponse>("/owner/verification/badges", {
    auth: true,
  });
}

function uploadVerificationDocument(
  restaurantId: number,
  documentType: "business-license" | "food-safety-certificate",
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<VerificationUploadResponse>(
    `/owner/restaurants/${restaurantId}/verification/uploads/${documentType}`,
    {
      auth: true,
      method: "POST",
      body: formData,
    },
  );
}

export function uploadBusinessLicense(restaurantId: number, file: File) {
  return uploadVerificationDocument(restaurantId, "business-license", file);
}

export function uploadFoodSafetyCertificate(restaurantId: number, file: File) {
  return uploadVerificationDocument(
    restaurantId,
    "food-safety-certificate",
    file,
  );
}

export function submitVerificationApplication(
  restaurantId: number,
  payload: {
    badgeId: number;
    businessLicenseUrl: string;
    businessLicensePublicId: string;
    foodSafetyCertUrl: string;
    foodSafetyCertPublicId: string;
    agreedToTerms: true;
  },
) {
  return apiRequest<VerificationApplication>(
    `/owner/restaurants/${restaurantId}/verification/applications`,
    {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
