import { OWNER_TOAST_MESSAGES } from "@/lib/app-toast";

const CAMPAIGN_ERROR_MESSAGES: Record<string, string> = {
  "Failed to load owner promotions.": "キャンペーン情報の読み込みに失敗しました。",
  "Promotion content is required.": "キャンペーン内容を入力してください。",
  "Promotion title is required.": "タイトルを入力してください。",
  "Target audience is required.": "対象ユーザーを選択してください。",
  "endDate must be after startDate.": "終了日は開始日より後の日付を選択してください。",
  "Only active promotions can be ended.": "実施中のキャンペーンのみ停止できます。",
  "Only ended promotions can be resumed.": "終了済みのキャンペーンのみ再開できます。",
  "Promotion not found for this owner.": "対象のキャンペーンが見つかりません。",
  "Restaurant not found for this owner.": "店舗情報が見つかりません。",
  "Only restaurant owners can create promotions.":
    "店舗オーナーのみキャンペーンを作成できます。",
  "Only restaurant owners can view promotions.":
    "店舗オーナーのみキャンペーンを確認できます。",
  "Only restaurant owners can update promotions.":
    "店舗オーナーのみキャンペーンを編集できます。",
  "Only restaurant owners can end promotions.":
    "店舗オーナーのみキャンペーンを停止できます。",
  "Only restaurant owners can resume promotions.":
    "店舗オーナーのみキャンペーンを再開できます。",
  "Only restaurant owners can request advertisements.":
    "店舗オーナーのみ広告リクエストを送信できます。",
  "Only restaurant owners can upload advertisement images.":
    "店舗オーナーのみ広告画像をアップロードできます。",
  "Advertisement advertisementType is required.":
    "広告タイプを選択してください。",
  "Campaign targetAudience must be one of: all, new.":
    "対象ユーザーを正しく選択してください。",
  "Campaign discountType and discountValue must match the locked dropdown options.":
    "割引タイプを正しく選択してください。",
  "Invalid or missing image file.": "画像ファイルを選択してください。",
  "Missing or invalid access token.": "ログイン情報が確認できません。再度ログインしてください。",
};

export function getCampaignErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return OWNER_TOAST_MESSAGES.error;
  }

  return CAMPAIGN_ERROR_MESSAGES[error.message] ?? OWNER_TOAST_MESSAGES.error;
}
