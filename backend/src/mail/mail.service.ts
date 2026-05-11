import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface TemporaryPasswordMailOptions {
  to: string;
  tempPassword: string;
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

  async sendTemporaryPassword(
    options: TemporaryPasswordMailOptions,
  ): Promise<void> {
    const { to, tempPassword, lang = 'vi' } = options;

    const fromName = this.config.get<string>('SMTP_FROM_NAME', 'Tabelink');
    const fromAddress = this.config.get<string>(
      'SMTP_FROM_ADDRESS',
      this.config.get<string>('SMTP_USER', 'noreply@tabelink.com'),
    );
    const from = `"${fromName}" <${fromAddress}>`;

    const isDev = this.config.get<string>('NODE_ENV') === 'development';

    const { subject, html } =
      lang === 'ja'
        ? this.buildJapaneseTemplate(tempPassword)
        : this.buildVietnameseTemplate(tempPassword);

    try {
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Temporary password email sent to ${to} [${lang}]`);
    } catch (err: unknown) {
      if (isDev) {
        this.logger.warn(
          `[DEV] Failed to send email to ${to}. Temp Password: ${tempPassword}`,
        );
        this.logger.warn(err);
      } else {
        this.logger.error(
          `Failed to send temporary password email to ${to}`,
          err,
        );
        throw err;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private template builders
  // ---------------------------------------------------------------------------

  private buildVietnameseTemplate(tempPassword: string) {
    const subject = '[Tabelink] Mật khẩu tạm thời mới của bạn';

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
    .password-box { background: #f8f8f8; border: 2px dashed #e63946; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0; }
    .password-text { font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 700; color: #e63946; letter-spacing: 2px; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
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
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Mật khẩu của bạn đã được đặt lại thành một mật khẩu tạm thời.</p>
      <p>Dưới đây là mật khẩu mới của bạn:</p>
      <div class="password-box">
        <span class="password-text">${tempPassword}</span>
      </div>
      <p class="note">⚠️ <strong>Lưu ý quan trọng:</strong> Vì lý do bảo mật, vui lòng đăng nhập ngay và đổi lại mật khẩu cá nhân của bạn trong phần cài đặt tài khoản.</p>
      <hr class="divider" />
      <p class="note">Nếu bạn không gửi yêu cầu này, vui lòng đăng nhập bằng mật khẩu tạm thời này và đổi mật khẩu ngay lập tức để bảo vệ tài khoản.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Tabelink. Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>`;

    return { subject, html };
  }

  private buildJapaneseTemplate(tempPassword: string) {
    const subject = '[Tabelink] 仮パスワードの発行について';

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
    .password-box { background: #f8f8f8; border: 2px dashed #e63946; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0; }
    .password-text { font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 700; color: #e63946; letter-spacing: 2px; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
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
      <p>パスワード再設定のリクエストを受け付けました。あなたのアカウントに新しい仮パスワードを発行いたしました。</p>
      <p>新しい仮パスワードは以下の通りです：</p>
      <div class="password-box">
        <span class="password-text">${tempPassword}</span>
      </div>
      <p class="note">⚠️ <strong>重要：</strong> セキュリティのため、ログイン後は速やかに設定画面よりパスワードを変更してください。</p>
      <hr class="divider" />
      <p class="note">このリクエストに心当たりがない場合は、この仮パスワードを使用してログインし、すぐにパスワードを変更してアカウントを保護してください。</p>
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
