"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificationBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CertificationBadgeModal({
  isOpen,
  onClose,
  onSuccess,
}: CertificationBadgeModalProps) {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile1(e.target.files[0]);
    }
  };

  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile2(e.target.files[0]);
    }
  };

  const isFormValid = file1 && file2 && isAgreed;

  const handleSubmit = () => {
    if (isFormValid) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#2f312f80] backdrop-blur-[5px]" 
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-[#f9f9f6] border border-[#e4beba33] rounded-[8px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[576px] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="border-b border-[#e2e3e0] px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-center">
              <div className="bg-[#d32f3133] size-12 rounded-[12px] flex items-center justify-center shrink-0">
                <FileText className="size-6 text-[#af111c]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-medium text-[#1a1c1b] tracking-[-0.6px] leading-[30px]">
                  TABELINK公式認証バッジの申請
                </h2>
                <p className="text-[14px] font-medium text-[#5a6053] leading-[20px]">
                  以下の必要書類をアップロードしてください。
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-[12px] hover:bg-[#eeeeeb] transition-colors"
            >
              <X className="size-[18px] text-[#5a6053]" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 flex flex-col gap-8">
          {/* File Upload Field 1 */}
          <div className="flex flex-col gap-3">
            <label className="text-[12px] font-medium text-[#1a1c1b] tracking-[1.2px] uppercase">
              営業許可証 / 事業登録証
            </label>
            <div 
              onClick={() => fileInputRef1.current?.click()}
              className={cn(
                "bg-white border-2 border-dashed rounded-[8px] p-[34px] flex flex-col items-center gap-1 cursor-pointer transition-colors",
                file1 ? "border-[#3d5f4633] bg-[#3d5f4605]" : "border-[#e4beba4d] hover:border-[#af111c4d]"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef1}
                className="hidden" 
                onChange={handleFileChange1}
                accept=".pdf,.jpg,.png"
              />
              {file1 ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="size-7 text-[#3d5f46]" />
                  <p className="text-[14px] font-medium text-[#1a1c1b] text-center">
                    {file1.name}
                  </p>
                  <p className="text-[11px] text-[#3d5f4699]">ファイルが選択されました</p>
                </div>
              ) : (
                <>
                  <Upload className="size-7 text-[#5a6053]" />
                  <p className="text-[14px] font-medium text-[#5a6053] text-center mt-1">
                    クリックしてファイルをアップロード、またはドラッグ＆ドロップ
                  </p>
                  <p className="text-[11px] text-[#5a605399]">
                    PDF, JPG, PNG (最大 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* File Upload Field 2 */}
          <div className="flex flex-col gap-3">
            <label className="text-[12px] font-medium text-[#1a1c1b] tracking-[1.2px] uppercase">
              食品安全管理基準適合証
            </label>
            <div 
              onClick={() => fileInputRef2.current?.click()}
              className={cn(
                "bg-white border-2 border-dashed rounded-[8px] p-[34px] flex flex-col items-center gap-1 cursor-pointer transition-colors",
                file2 ? "border-[#3d5f4633] bg-[#3d5f4605]" : "border-[#e4beba4d] hover:border-[#af111c4d]"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef2}
                className="hidden" 
                onChange={handleFileChange2}
                accept=".pdf,.jpg,.png"
              />
              {file2 ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="size-7 text-[#3d5f46]" />
                  <p className="text-[14px] font-medium text-[#1a1c1b] text-center">
                    {file2.name}
                  </p>
                  <p className="text-[11px] text-[#3d5f4699]">ファイルが選択されました</p>
                </div>
              ) : (
                <>
                  <Upload className="size-7 text-[#5a6053]" />
                  <p className="text-[14px] font-medium text-[#5a6053] text-center mt-1">
                    クリックしてファイルをアップロード、またはドラッグ＆ドロップ
                  </p>
                  <p className="text-[11px] text-[#5a605399]">
                    PDF, JPG, PNG (最大 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-[#f4f4f1] p-4 rounded-[4px] flex gap-3 items-start">
            <div className="pt-1">
              <input 
                type="checkbox" 
                id="terms"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="size-4 rounded-[2px] border-[#e4beba] text-[#af111c] focus:ring-[#af111c]"
              />
            </div>
            <label htmlFor="terms" className="flex flex-col gap-0.5 cursor-pointer">
              <span className="text-[14px] font-medium text-[#1a1c1b]">利用規約への同意</span>
              <span className="text-[14px] font-medium text-[#5a6053] leading-[22.75px]">
                アップロードされたすべての書類が最新かつ正確であることを証明し、TABELINKの認証ガイドラインに従うことに同意します。
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f4f4f1] px-8 py-8 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-[10px] text-[14px] font-medium text-[#5a6053] hover:text-[#1a1c1b] transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={cn(
              "px-8 py-[10px] text-[14px] font-medium rounded-[6px] transition-all flex items-center gap-2",
              isFormValid 
                ? "bg-[#af111c] text-white shadow-[0px_10px_15px_-3px_rgba(175,17,28,0.2)] hover:bg-[#960e18]" 
                : "bg-[#e2e3e0] text-[#5a6053] cursor-not-allowed"
            )}
          >
            申請する
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
