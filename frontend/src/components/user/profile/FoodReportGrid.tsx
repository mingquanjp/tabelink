"use client";

import { useState } from "react";
import { FoodReportCard } from "./FoodReportCard";
import { PostDetailModal } from "./PostDetailModal";
import type { FoodReport } from "./profile-data";

type FoodReportGridProps = {
  reports: FoodReport[];
};

export function FoodReportGrid({ reports }: FoodReportGridProps) {
  const [selectedReport, setSelectedReport] = useState<FoodReport | null>(null);

  return (
    <>
      <section
        className="grid grid-cols-2 gap-x-8 gap-y-8 pt-8 max-md:grid-cols-1"
        aria-label="Food reports"
      >
        {reports.map((report) => (
          <FoodReportCard
            key={report.id}
            report={report}
            onOpen={setSelectedReport}
          />
        ))}
      </section>

      <PostDetailModal
        open={selectedReport !== null}
        report={selectedReport}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null);
          }
        }}
      />
    </>
  );
}
