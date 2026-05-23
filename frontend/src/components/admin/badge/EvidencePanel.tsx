import { FileText, ReceiptText, ShieldCheck, UsersRound } from "lucide-react";
import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import { fallbackRestaurantImages } from "./badge-review-data";
import { DetailRow } from "./DetailRow";
import { DocumentLink } from "./DocumentLink";
import { SectionHeading } from "./SectionHeading";

type EvidencePanelProps = {
  application: AdminBadgeApplication;
  onPreviewImage: (imageUrl: string) => void;
};

export function EvidencePanel({
  application,
  onPreviewImage,
}: EvidencePanelProps) {
  const evidencePhotos =
    application.evidencePhotos.length > 0
      ? application.evidencePhotos.slice(0, 2)
      : fallbackRestaurantImages.hygiene;
  const businessLicenseViewerUrl = application.documents.businessLicenseUrl
    ? `/admin/badge/documents/${application.appId}/business-license`
    : null;
  const foodSafetyViewerUrl = application.documents.foodSafetyCertUrl
    ? `/admin/badge/documents/${application.appId}/food-safety-certificate`
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <SectionHeading>衛生管理証明写真</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          {evidencePhotos.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              className="overflow-hidden rounded bg-[#f4f4f1]"
              onClick={() => onPreviewImage(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={index === 0 ? "調理場" : "衛生設備"}
                className="aspect-[1.28/1] w-full object-cover transition-transform hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>提出書類の確認</SectionHeading>
        <div className="grid gap-3">
          <DocumentLink
            label="営業許可証"
            href={businessLicenseViewerUrl}
            Icon={FileText}
          />
          <DocumentLink
            label="食品安全証明書"
            href={foodSafetyViewerUrl}
            Icon={ShieldCheck}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>店舗詳細情報</SectionHeading>
        <div className="flex flex-col gap-4 rounded-lg bg-[#f4f4f1] p-4">
          <DetailRow
            label="日本人常駐スタッフ"
            value={application.details.hasJapaneseStaff ? "確認済み" : "未確認"}
            Icon={UsersRound}
          />
          <DetailRow
            label="VATインボイス発行"
            value={
              application.details.canIssueVatInvoice ? "対応可能" : "未対応"
            }
            Icon={ReceiptText}
          />
        </div>
      </section>
    </div>
  );
}
