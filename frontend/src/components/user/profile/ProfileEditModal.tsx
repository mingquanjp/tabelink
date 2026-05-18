"use client";
/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { changeUserPassword, getUserFullProfile, updateProfileText, uploadUserAvatar } from "@/lib/api/user-profile/API";
import { UpdateProfileTextRequest, UserProfileResponse } from "@/lib/api/user-profile/type";
import { Camera, ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { profileSummary } from "./profile-data";

type ProfileEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileResponse;
  setProfile: (profile: UserProfileResponse) => void;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="font-jp text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
      {children}
    </label>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="h-12 rounded-md bg-[#e2e3e0] px-4 font-jp text-base font-medium leading-6 text-[#1a1c1b] outline-none transition-colors focus:bg-[#d9dbd8]"
      />
    </div>
  );
}

function SelectField({
  label,
  defaultValue,
  options,
  name
}: {
  label: string;
  defaultValue: string;
  options: string[];
  name: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          defaultValue={defaultValue}
          name={name}
          className="h-12 w-full appearance-none rounded-md bg-[#e2e3e0] px-4 pr-10 font-jp text-base font-medium leading-6 text-[#1a1c1b] outline-none transition-colors focus:bg-[#d9dbd8]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#5a6053]" />
      </div>
    </div>
  );
}

export function ProfileEditModal({
  open,
  onOpenChange,
  profile,
  setProfile
}: ProfileEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const rawFormData = new FormData(formElement);

    console.log("Dữ liệu gửi đi:");
    for (let [key, value] of rawFormData.entries()) {
      console.log(`${key}:`, value);
    }
    try {
      const textData: UpdateProfileTextRequest = {
        fullName: rawFormData.get("fullName") as string,
        purpose: rawFormData.get("purpose") as string,
        gender: rawFormData.get("gender") as string,
        nationality: rawFormData.get("nationality") as string,
      };
      await updateProfileText(textData);

      if (selectedFile) await uploadUserAvatar(selectedFile);

      const newPass = rawFormData.get("newPassword") as string;
      if (newPass && newPass.trim() !== "") {
        await changeUserPassword({
          currentPassword: rawFormData.get("currentPassword") as string,
          newPassword: newPass,
          confirmPassword: rawFormData.get("confirmPassword") as string,
        });
      }

      const updated = await getUserFullProfile();
      setProfile(updated);
      onOpenChange(false);
      toast.success("プロフィールを更新しました。");
    } catch (err: any) {
      toast.error(err.message || "変更は失敗しました");
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link xem trước
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-48px)] w-[560px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-lg border-0 bg-[#f9f9f6] p-0 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-8 p-8">
          <div className="flex items-center justify-between gap-6">
            <DialogTitle className="font-jp text-2xl font-medium leading-8 tracking-[-0.6px] text-[#1a1c1b]">
              プロフィールを編集
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close profile editor"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#5a6053] transition-colors hover:bg-[#e2e3e0]"
              >
                <X className="size-5" strokeWidth={2} />
              </button>
            </DialogClose>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSave}>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-6 border-b border-[rgba(228,190,186,0.15)] pb-6">
              <button
                type="button"
                className="group relative size-20 shrink-0 overflow-hidden rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={previewUrl ?? profile.avatarUrl ?? profileSummary.avatarUrl} className="size-20 rounded-xl object-cover" draggable={false} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-4 text-white" />
                </span>
              </button>

              <div className="flex flex-col gap-1">
                <p className="font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
                  プロフィール写真
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-fit font-jp text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#af111c]"
                >
                  写真の変更
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <TextField label="名前" name="fullName" defaultValue={profile.fullName} />

              <div className="flex flex-col gap-2">
                <FieldLabel>自己紹介</FieldLabel>
                <textarea
                  name="purpose"
                  defaultValue={profile.purpose ?? ""}
                  className="min-h-[96px] rounded-md bg-[#e2e3e0] px-4 py-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <SelectField
                  label="性別"
                  name="gender"
                  defaultValue={profile.gender ?? "男性"}
                  options={["男性", "女性", "その他"]}
                />
                <SelectField
                  label="国籍"
                  name="nationality"
                  defaultValue={profile.nationality ?? "日本"}
                  options={["日本", "ベトナム", "その他"]}
                />
              </div>

              <div className="border-t border-[rgba(228,190,186,0.15)] pt-4">
                <p className="font-jp text-sm font-medium leading-5 text-[#1a1c1b]">
                  パスワードの変更
                </p>
              </div>

              <TextField label="現在のパスワード" name="currentPassword" type="password" defaultValue="" />
              <TextField
                label="新しいパスワード"
                name="newPassword"
                defaultValue=""
                type="password"
              />
              <TextField
                label="新しいパスワードを再入力"
                name="confirmPassword"
                defaultValue=""
                type="password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 max-sm:grid-cols-1">
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-12 rounded-md border border-[rgba(228,190,186,0.3)] bg-transparent font-jp text-sm font-medium leading-5 text-[#5a6053] transition-colors hover:bg-white"
                >
                  キャンセル
                </button>
              </DialogClose>
              <button
                type="submit"
                className="h-12 rounded-md bg-[linear-gradient(168deg,#af111c_0%,#d32f31_100%)] font-jp text-sm font-medium leading-5 text-white shadow-[0_10px_15px_-3px_rgba(175,17,28,0.2),0_4px_6px_-4px_rgba(175,17,28,0.2)]"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
