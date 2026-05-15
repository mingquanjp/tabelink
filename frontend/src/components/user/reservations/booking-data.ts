export const requestTemplates = [
  {
    id: "no-coriander",
    requestType: "Coriander",
    title: "パクチー抜き",
    description: "すべての料理からパクチー（コリアンダー）を除きます。",
  },
  {
    id: "less-spicy",
    requestType: "LessSpicy",
    title: "辛さ控えめ",
    description: "辛味を抑えた味付けで調理いたします。",
  },
  {
    id: "receipt-vat",
    requestType: "VATInvoice",
    title: "領収書・VAT希望",
    description: "法人様向けの領収書（VATインボイス）が必要な場合。",
  },
  {
    id: "private-room",
    requestType: "PrivateRoom",
    title: "個室希望",
    description: "会食や大切な集まりに最適な個室を優先的に手配します。",
  },
] as const;

export type RequestTemplateId = (typeof requestTemplates)[number]["id"];
