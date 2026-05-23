"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type ImagePreviewDialogProps = {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({
  imageUrl,
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={Boolean(imageUrl)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] rounded-lg bg-white p-4">
        <DialogTitle className="sr-only">衛生管理証明写真</DialogTitle>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="衛生管理証明写真"
            className="max-h-[80vh] w-full rounded object-contain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
