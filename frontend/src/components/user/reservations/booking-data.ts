export const restaurantImage =
  "https://www.figma.com/api/mcp/asset/4cbc287f-eba8-45c6-a823-51eb7ef615f6";

export const breadcrumbs = ["探す", "ハノイのダイニング", "予約手続き"];

export const bookingFields = [
  {
    label: "氏名",
    value: "例：田中 太郎",
    tone: "muted",
  },
  {
    label: "電話番号",
    value: "090-1234-5678",
    tone: "muted",
  },
  {
    label: "予約日",
    value: "11/25/2024",
    tone: "strong",
  },
] as const;

export const requestTemplates = [
  {
    id: "no-coriander",
    title: "パクチー抜き",
    description: "すべての料理からパクチー（コリアンダー）を除きます。",
  },
  {
    id: "less-spicy",
    title: "辛さ控えめ",
    description: "辛味を抑えた味付けで調理いたします。",
  },
  {
    id: "receipt-vat",
    title: "領収書・VAT希望",
    description: "法人様向けの領収書（VATインボイス）が必要な場合。",
  },
  {
    id: "private-room",
    title: "個室希望",
    description: "会食や大切な集まりに最適な個室を優先的に手配します。",
  },
] as const;

export type RequestTemplateId = (typeof requestTemplates)[number]["id"];
