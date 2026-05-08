"use client";

import { Plus, Utensils, Camera, X, Info, ChevronRight, Star } from "lucide-react";
import Image from "next/image";

const menuItems = [
  {
    id: 1,
    nameJp: "特製ブンチャー",
    nameVn: "Bún Chả Đặc Biệt",
    price: "120,000",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=400&q=80",
    isRecommended: true,
    isSoldOut: false,
    isSelected: true,
  },
  {
    id: 2,
    nameJp: "手打ち牛肉フォー",
    nameVn: "Phở Bò Gia Truyền",
    price: "95,000",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80",
    isRecommended: false,
    isSoldOut: true,
    isSelected: false,
  },
  {
    id: 3,
    nameJp: "揚げ春巻き（4本）",
    nameVn: "Nem Rán Hà Nội",
    price: "60,000",
    image: "/menu/nemran.png",
    isRecommended: false,
    isSoldOut: false,
    isSelected: false,
  },
  {
    id: 4,
    nameJp: "空芯菜のニンニク炒め",
    nameVn: "Rau Muống Xào Tỏi",
    price: "45,000",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
    isRecommended: false,
    isSoldOut: false,
    isSelected: false,
  },
];

export default function OwnerMenuPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-12">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1a1c1b] tracking-tight">
          メニュー管理
        </h1>
        <p className="text-base font-medium text-[#5a6053]">
          料理の登録・編集とバイリンガル設定
        </p>
      </section>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Menu List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="size-[18px] text-[#af111c]" />
                <h2 className="text-[20px] font-medium">現在のメニュー</h2>
              </div>
              <span className="bg-[#e8e8e5] px-3 py-1 rounded-[12px] text-[12px] font-bold text-[#5a6053] uppercase tracking-[-0.6px]">
                12 ITEMS
              </span>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {menuItems.map((item) => (
                <div 
                  key={item.id}
                  className={`relative flex gap-4 p-4 rounded-lg bg-white transition-all cursor-pointer ${
                    item.isSelected ? "ring-2 ring-[#af111c]" : "hover:bg-white/50"
                  } ${item.isSoldOut ? "opacity-70" : ""}`}
                >
                  {item.isSoldOut && (
                    <div className="absolute inset-0 bg-white/40 mix-blend-saturation rounded-lg pointer-events-none z-10" />
                  )}
                  
                  {/* Item Image */}
                  <div className="relative size-24 shrink-0 rounded-[4px] overflow-hidden">
                    <img src={item.image} alt={item.nameJp} className="size-full object-cover" />
                    {item.isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-black/80 px-2 py-1 rounded-[2px] text-[10px] text-white">品切れ</span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-[18px] font-medium leading-tight">{item.nameJp}</h3>
                        {item.isRecommended && (
                          <span className="bg-[#af111c] px-2 py-0.5 rounded-[2px] text-[10px] text-[#fff2f0] font-medium tracking-[0.5px]">
                            おすすめ
                          </span>
                        )}
                        {item.isSoldOut && !item.isRecommended && (
                          <span className="bg-[#a1a1aa] px-2 py-0.5 rounded-[2px] text-[10px] text-white font-medium tracking-[0.5px]">
                            品切れ
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#5a6053]">{item.nameVn}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-bold text-[#af111c]">VND</span>
                        <span className="text-[18px] font-bold tracking-tight">{item.price}</span>
                      </div>
                      <button className={`px-3 py-1.5 border rounded-[4px] text-[10px] font-medium uppercase tracking-[-0.5px] transition-colors ${
                        item.isSoldOut 
                          ? "bg-[#af111c] border-[#af111c] text-white hover:bg-[#910e17]" 
                          : "border-[#af111c] text-[#af111c] hover:bg-[#af111c]/5"
                      }`}>
                        {item.isSoldOut ? "販売再開する" : "品切れにする"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-4 bg-[#af111c] text-white rounded-lg shadow-md hover:bg-[#910e17] transition-all">
              <Plus className="size-5" />
              <span className="text-[16px]">新規メニュー追加</span>
            </button>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[16px] shadow-sm border border-[#e4beba]/10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-medium">詳細を編集</h2>
              <div className="flex items-center gap-3">
                <button className="px-6 py-2 bg-[#f4f4f5] text-[#5a6053] text-[14px] font-medium rounded-[8px] hover:bg-[#e4e4e7] transition-colors">
                  破棄
                </button>
                <button className="px-8 py-2 bg-[#af111c] text-white text-[14px] font-medium rounded-[8px] shadow-sm hover:bg-[#910e17] transition-all">
                  変更を保存
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Photo Upload Section */}
              <div className="space-y-3">
                <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">メイン写真</label>
                <div className="border-2 border-dashed border-[#e4beba] rounded-[16px] p-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f9f9f6] transition-colors">
                  <Camera className="size-6 text-[#5a6053]" />
                  <span className="text-[14px] font-medium">写真を変更</span>
                  <span className="text-[10px] text-[#5a6053]">PNG, JPG (Max. 10MB)</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">日本語名</label>
                  <input 
                    type="text" 
                    defaultValue="特製ブンチャー"
                    className="w-full bg-[#e2e3e0]/30 px-4 py-3 rounded-[8px] text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">ベトナム語名</label>
                  <input 
                    type="text" 
                    defaultValue="Bún Chả Đặc Biệt"
                    className="w-full bg-[#e2e3e0]/30 px-4 py-3 rounded-[8px] text-[16px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">日本語説明</label>
                  <textarea 
                    rows={3}
                    defaultValue="炭火で丁寧に焼き上げた豚肉とつくねを、甘酸っぱい秘伝のタレでお召し上がりください。新鮮なハーブをたっぷりと添えて提供します。"
                    className="w-full bg-[#e2e3e0]/30 px-4 py-3 rounded-[8px] text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c] resize-none"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">材料 (日本語)</label>
                  <textarea 
                    rows={2}
                    defaultValue="豚バラ肉、つくね、米麺、人参、大根のなます、レタス、ミント、香菜、魚醤ベースのタレ"
                    className="w-full bg-[#e2e3e0]/30 px-4 py-3 rounded-[8px] text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#af111c] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">価格 (VND)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a6053] font-bold">₫</span>
                    <input 
                      type="text" 
                      defaultValue="120,000"
                      className="w-full bg-[#e2e3e0]/30 pl-8 pr-4 py-3 rounded-[8px] text-[16px] font-bold focus:outline-none focus:ring-1 focus:ring-[#af111c]" 
                    />
                  </div>
                </div>
              </div>

              {/* Custom Ratings */}
              <div className="pt-6 border-t border-[#e4beba]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-[#5a6053] tracking-[1.2px] uppercase">追加評価 (カスタム)</label>
                  <button className="flex items-center gap-1 text-[#af111c] text-[10px] font-medium">
                    <Plus className="size-3" />
                    項目を追加
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#f9f9f6] border border-[#e4beba]/30 rounded-[8px] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-bold">酸味 (Sourness)</p>
                      <p className="text-[10px] text-[#5a6053]">Lv. 3 / 5</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => <div key={i} className="size-2 rounded-full bg-[#af111c]" />)}
                      {[4, 5].map((i) => <div key={i} className="size-2 rounded-full bg-[#e2e3e0]" />)}
                    </div>
                  </div>
                  <div className="bg-[#f9f9f6] border border-[#e4beba]/30 rounded-[8px] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-bold">ボリューム</p>
                      <p className="text-[10px] text-[#5a6053]">Lv. 4 / 5</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => <div key={i} className="size-2 rounded-full bg-[#af111c]" />)}
                      {[5].map((i) => <div key={i} className="size-2 rounded-full bg-[#e2e3e0]" />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 flex items-center justify-between bg-[#f9f9f6] p-4 rounded-[16px] border border-[#e4beba]/10">
                <span className="text-[14px] font-medium">おすすめ設定</span>
                <div className="w-10 h-5 bg-[#af111c] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 size-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </div>
    </main>
  );
}
