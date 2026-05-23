import { notFound } from "next/navigation";
import { AdminDocumentViewer } from "@/components/admin/badge/AdminDocumentViewer";

type AdminBadgeDocumentPageProps = {
  params: Promise<{
    appId: string;
    documentType: string;
  }>;
};

export default async function AdminBadgeDocumentPage({
  params,
}: AdminBadgeDocumentPageProps) {
  const { appId, documentType } = await params;
  const numericAppId = Number(appId);

  if (
    !Number.isInteger(numericAppId) ||
    (documentType !== "business-license" &&
      documentType !== "food-safety-certificate")
  ) {
    notFound();
  }

  return (
    <AdminDocumentViewer appId={numericAppId} documentType={documentType} />
  );
}
