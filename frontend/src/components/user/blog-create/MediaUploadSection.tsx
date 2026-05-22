import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null)
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);
  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null)
      return;
    }
    const objectUrl = URL.createObjectURL(videoFile);
    setVideoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [videoFile]);
  return (
    <section
      aria-label="メディアアップロード"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <div className="relative md:col-span-2 group">
        <label className="block cursor-pointer md:col-span-2">
          <Card className="h-60 rounded-lg border-2 border-dashed border-[#e4beba] bg-[#f4f4f1] py-0 shadow-none md:h-[400px]">
            <CardContent className="relative flex h-full flex-col items-center justify-center p-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 p-6">
                  <Camera className="size-6 text-[#af111c]" />
                  <span className="font-jp text-sm font-medium leading-5 tracking-[1.4px] text-[#5a6053]">
                    高画質写真をドラッグ
                  </span>
                  <span className="font-manrope text-xs leading-4 text-[#8f6f6c]">
                    最大 20MB
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
          />
        </label>
        {photoFile && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onPhotoChange(null)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="relative group">
        <label className="block cursor-pointer">
          <Card className="h-60 rounded-lg border-2 border-dashed border-[#e4beba] bg-[#f4f4f1] py-0 shadow-none md:h-[400px]">
            <CardContent className="relative flex h-full flex-col items-center justify-center gap-3 p-6">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  className="h-full w-full object-cover"
                  controls={false}
                  muted
                  loop
                  autoPlay
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-6">
                  <Video className="size-5 text-[#6f705f]" />
                </div>
              )}
            </CardContent>
          </Card>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="sr-only"
            onChange={(event) => onVideoChange(event.target.files?.[0] ?? null)}
          />
        </label>

        {videoFile && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onVideoChange(null)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </section>
  );
}
