import {
  ChevronDown,
  ImagePlus,
  MapPin,
  Send,
  Star,
  Trash2,
  Utensils,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HomepagePost, HomepageUser } from "./homepage-data";
import { HomepageAvatar } from "./HomepageAvatar";

type ComposerCardProps = {
  user: HomepageUser;
  onCreatePost: (post: HomepagePost) => void;
};

const ratingOptions = [
  { key: "hygiene", label: "衛生面" },
  { key: "taste", label: "味" },
  { key: "service", label: "サービス" },
] as const;

const fallbackPostImage =
  "https://www.figma.com/api/mcp/asset/3d6ca905-7308-4b84-8c12-7d033a31a036";

export function ComposerCard({ user, onCreatePost }: ComposerCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [ratings, setRatings] = useState({
    hygiene: 5,
    taste: 5,
    service: 5,
  });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();
    const trimmedCheckIn = checkIn.trim();

    if (!trimmedBody && !imagePreview) {
      return;
    }

    onCreatePost({
      id: Date.now(),
      authorAccountId: user.accountId,
      author: user.name,
      handle: user.handle,
      initials: user.initials,
      time: "たった今",
      restaurant: trimmedCheckIn || "TABELINK Community",
      title: trimmedCheckIn
        ? `${trimmedCheckIn} にチェックインしました`
        : "レストラン体験をシェアしました",
      body: trimmedBody || "写真を投稿しました。",
      image: imagePreview || fallbackPostImage,
      tags: trimmedCheckIn ? ["#CHECKIN", "#TABELINK"] : ["#TABELINK"],
      metrics: ratings,
      likes: 0,
      comments: 0,
    });

    setBody("");
    setCheckIn("");
    setImagePreview("");
    setRatings({ hygiene: 5, taste: 5, service: 5 });
    setIsExpanded(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="rounded-lg border-[#e7e5df] bg-white py-0 shadow-none">
      <CardContent className="px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <HomepageAvatar initials={user.initials} />
            <div className="min-w-0 flex-1">
              {isExpanded ? (
                <textarea
                  className="min-h-16 w-full resize-none rounded-lg bg-[#f4f4f1] px-4 py-3 font-jp text-[13px] font-medium leading-6 text-[#1a1c1b] outline-none placeholder:text-[#7a7f74] focus:ring-2 focus:ring-[#af111c33]"
                  maxLength={500}
                  placeholder="今日のレストラン体験をシェア..."
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              ) : (
                <button
                  type="button"
                  className="flex h-11 w-full items-center rounded-full bg-[#f4f4f1] px-4 text-left font-jp text-[13px] font-medium text-[#7a7f74]"
                  onClick={() => setIsExpanded(true)}
                >
                  今日のレストラン体験をシェア...
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[#7a7f74]"
              aria-label="Expand post composer"
              onClick={() => setIsExpanded((value) => !value)}
            >
              <ChevronDown
                className={`size-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {isExpanded ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-[#e7e5df] bg-white px-3 py-2">
              <MapPin className="size-4 shrink-0 text-[#af111c]" />
              <input
                className="min-w-0 flex-1 font-jp text-[12px] font-medium text-[#1a1c1b] outline-none placeholder:text-[#9a9f93]"
                maxLength={80}
                placeholder="チェックインする店舗名"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </div>
          ) : null}

          {isExpanded && imagePreview ? (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-[#e7e5df]">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${imagePreview})` }}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute right-3 top-3 bg-white"
                aria-label="Remove selected photo"
                onClick={() => setImagePreview("")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null}

          {isExpanded ? (
            <div className="mt-3 grid gap-2 rounded-md bg-[#f9f9f6] px-3 py-3">
              {ratingOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-jp text-[11px] font-semibold text-[#5a6053]">
                    {option.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      const isActive = value <= ratings[option.key];

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${option.label} ${value}`}
                          className="text-[#af111c]"
                          onClick={() =>
                            setRatings((current) => ({
                              ...current,
                              [option.key]: value,
                            }))
                          }
                        >
                          <Star
                            className={`size-3.5 ${
                              isActive ? "fill-[#af111c]" : "text-[#d8d8d2]"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-[#f0eee8] pt-3 max-sm:grid-cols-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="ghost"
              className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
              onClick={() => {
                setIsExpanded(true);
                fileInputRef.current?.click();
              }}
            >
              <ImagePlus className="size-4 text-[#af111c]" />
              写真
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
              onClick={() => {
                setIsExpanded(true);
                setCheckIn((value) => value || "Hoàng Yến Cuisine");
              }}
            >
              <Utensils className="size-4 text-[#af111c]" />
              チェックイン
            </Button>
            {isExpanded ? (
              <Button
                type="submit"
                className="h-8 gap-2 bg-[#af111c] px-4 font-jp text-[12px] hover:bg-[#8f0e17]"
                disabled={!body.trim() && !imagePreview}
              >
                <Send className="size-4" />
                投稿する
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
                onClick={() => setIsExpanded(true)}
              >
                <Star className="size-4 text-[#af111c]" />
                評価
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
