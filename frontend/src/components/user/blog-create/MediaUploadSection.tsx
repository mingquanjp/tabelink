import { Camera, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MediaUploadSectionProps = {
  photoFile?: File | null;
  videoFile?: File | null;
  onPhotoChange: (file: File | null) => void;
  onVideoChange: (file: File | null) => void;
};

export function MediaUploadSection({
  photoFile,
  videoFile,
  onPhotoChange,
  onVideoChange,
}: MediaUploadSectionProps) {
  return (
    <section
      aria-label="メディアアップロード"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <label className="block cursor-pointer md:col-span-2">
        <Card className="h-60 rounded-lg border-2 border-dashed border-[#e4beba] bg-[#f4f4f1] py-0 shadow-none md:h-[400px]">
          <CardContent className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <Camera className="size-6 text-[#af111c]" />
            <span className="font-jp text-sm font-medium leading-5 tracking-[1.4px] text-[#5a6053]">
              高画質写真をドラッグ
            </span>
            <span className="font-manrope text-xs leading-4 text-[#8f6f6c]">
              最大 20MB
            </span>
            {photoFile ? (
              <span className="mt-3 max-w-full truncate font-jp text-xs text-[#af111c]">
                {photoFile.name}
              </span>
            ) : null}
          </CardContent>
        </Card>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
        />
      </label>

      <label className="block cursor-pointer">
        <Card className="h-60 rounded-lg border-2 border-dashed border-[#e4beba] bg-[#f4f4f1] py-0 shadow-none md:h-[400px]">
          <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6">
            <Video className="size-5 text-[#6f705f]" />
            {videoFile ? (
              <span className="max-w-full truncate font-jp text-xs text-[#5a6053]">
                {videoFile.name}
              </span>
            ) : null}
          </CardContent>
        </Card>
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="sr-only"
          onChange={(event) => onVideoChange(event.target.files?.[0] ?? null)}
        />
      </label>
    </section>
  );
}
