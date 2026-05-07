import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface PasswordResetMailOptions {
  to: string;
  resetToken: string;
  /** 'vi' | 'ja' — defaults to 'vi' */
  lang?: 'vi' | 'ja';
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER', ''),
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendPasswordReset(options: PasswordResetMailOptions): Promise<void> {
    const { to, resetToken, lang = 'vi' } = options;

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const fromName = this.config.get<string>('SMTP_FROM_NAME', 'Tabelink');
    const fromAddress = this.config.get<string>(
      'SMTP_FROM_ADDRESS',
      this.config.get<string>('SMTP_USER', 'noreply@tabelink.com'),
    );
    const from = `"${fromName}" <${fromAddress}>`;

    const isDev = this.config.get<string>('NODE_ENV') === 'development';

    const { subject, html } =
      lang === 'ja'
        ? this.buildJapaneseTemplate(resetUrl)
        : this.buildVietnameseTemplate(resetUrl);

    try {
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Password reset email sent to ${to} [${lang}]`);
    } catch (err: unknown) {
      if (isDev) {
        // Dev: just log, don't crash the request
        this.logger.warn(
          `[DEV] Failed to send email to ${to}. Reset URL: ${resetUrl}`,
        );
        this.logger.warn(err);
      } else {
        this.logger.error(`Failed to send password reset email to ${to}`, err);
        throw err;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private template builders
  // ---------------------------------------------------------------------------

  private buildVietnameseTemplate(resetUrl: string) {
    const subject = '[Tabelink] Yêu cầu đặt lại mật khẩu';

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #e63946; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
    .body { padding: 36px 40px; }
    .body p { margin: 0 0 16px; color: #333333; font-size: 15px; line-height: 1.6; }
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #e63946; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
    .link-fallback { background: #f8f8f8; border-radius: 6px; padding: 12px 16px; word-break: break-all; font-size: 12px; color: #666666; }
    .note { color: #999999 !important; font-size: 13px !important; }
    .footer { background: #f8f8f8; padding: 20px 40px; text-align: center; }
    .footer p { margin: 0; color: #aaaaaa; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍜 Tabelink</h1>
      <p>Nền tảng tìm kiếm nhà hàng dành cho người Nhật tại Việt Nam</p>
    </div>
    <div class="body">
      <p>Xin chào,</p>
      <p>Chúng tôi nhận được yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản liên kết với địa chỉ email này.</p>
      <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
      <div class="btn-wrap">
        <a href="${resetUrl}" class="btn">Đặt lại mật khẩu</a>
      </div>
      <p class="note">⏰ Đường link có hiệu lực trong <strong>60 phút</strong> và chỉ sử dụng được <strong>một lần</strong>.</p>
      <hr class="divider" />
      <p>Nếu nút không hoạt động, hãy sao chép đường link dưới đây vào trình duyệt:</p>
      <div class="link-fallback">${resetUrl}</div>
      <hr class="divider" />
      <p class="note">Nếu bạn <strong>không</strong> gửi yêu cầu này, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Tabelink. Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>`;

    return { subject, html };
  }

  private buildJapaneseTemplate(resetUrl: string) {
    const subject = '[Tabelink] パスワード再設定のご案内';

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Hiragino Sans', 'Meiryo', 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #e63946; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
    .body { padding: 36px 40px; }
    .body p { margin: 0 0 16px; color: #333333; font-size: 15px; line-height: 1.8; }
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #e63946; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
    .link-fallback { background: #f8f8f8; border-radius: 6px; padding: 12px 16px; word-break: break-all; font-size: 12px; color: #666666; }
    .note { color: #999999 !important; font-size: 13px !important; }
    .footer { background: #f8f8f8; padding: 20px 40px; text-align: center; }
    .footer p { margin: 0; color: #aaaaaa; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍜 Tabelink</h1>
      <p>ベトナムのレストランを探す日本人向けプラットフォーム</p>
    </div>
    <div class="body">
      <p>こんにちは、</p>
      <p>このメールアドレスに紐づくアカウントに対して、<strong>パスワード再設定</strong>のリクエストを受け付けました。</p>
      <p>下のボタンをクリックして、新しいパスワードを設定してください：</p>
      <div class="btn-wrap">
        <a href="${resetUrl}" class="btn">パスワードを再設定する</a>
      </div>
      <p class="note">⏰ このリンクは<strong>60分間</strong>有効で、<strong>1回のみ</strong>使用可能です。</p>
      <hr class="divider" />
      <p>ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください：</p>
      <div class="link-fallback">${resetUrl}</div>
      <hr class="divider" />
      <p class="note">このリクエストに心当たりがない場合は、このメールを無視してください。アカウントは安全です。</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Tabelink. このメールは自動送信です。返信はご遠慮ください。</p>
    </div>
  </div>
</body>
</html>`;

    return { subject, html };
  }
}
