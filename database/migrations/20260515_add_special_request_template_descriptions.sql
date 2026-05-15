BEGIN;

ALTER TABLE special_request_template
    ADD COLUMN IF NOT EXISTS descriptionvn TEXT,
    ADD COLUMN IF NOT EXISTS descriptionjp TEXT;

UPDATE special_request_template
SET
    descriptionvn = 'Loại bỏ rau mùi/ngò khỏi tất cả món ăn.',
    descriptionjp = 'すべての料理からパクチー（コリアンダー）を除きます。'
WHERE requesttype = 'Coriander'
  AND (descriptionvn IS NULL OR descriptionjp IS NULL);

UPDATE special_request_template
SET
    descriptionvn = 'Chế biến món ăn với vị cay nhẹ hơn.',
    descriptionjp = '辛味を抑えた味付けで調理いたします。'
WHERE requesttype = 'LessSpicy'
  AND (descriptionvn IS NULL OR descriptionjp IS NULL);

UPDATE special_request_template
SET
    descriptionvn = 'Yêu cầu xuất hóa đơn VAT cho mục đích công tác/doanh nghiệp.',
    descriptionjp = '法人利用向けの領収書（VATインボイス）が必要な場合。'
WHERE requesttype = 'VATInvoice'
  AND (descriptionvn IS NULL OR descriptionjp IS NULL);

UPDATE special_request_template
SET
    descriptionvn = 'Yêu cầu khác sẽ được gửi đến nhân viên nhà hàng.',
    descriptionjp = 'その他、スタッフに伝えたい内容を送信します。'
WHERE requesttype = 'Other'
  AND (descriptionvn IS NULL OR descriptionjp IS NULL);

COMMIT;
