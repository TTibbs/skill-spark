interface ResetPasswordEmailProps {
  username: string;
  resetToken: string;
  deepLinkUrl: string;
  webResetUrl: string | null;
  expirationMinutes: number;
}

export function generatePasswordResetEmail({
  username,
  resetToken,
  deepLinkUrl,
  webResetUrl,
  expirationMinutes,
}: ResetPasswordEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 90%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.5;">
                Hi <strong>${username}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.5;">
                We received a request to reset your password for your Kids Learning App account. If you didn't make this request, you can safely ignore this email.
              </p>

              <!-- Primary CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${deepLinkUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Open App & Reset Password
                </a>
              </div>

              <p style="margin: 24px 0 16px; color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                <em>If the button above doesn't work, you can also:</em>
              </p>

              ${
                webResetUrl
                  ? `
              <!-- Alternative: Web Link (optional - only if configured) -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 16px 0;">
                <p style="margin: 0 0 12px; color: #333333; font-size: 14px; font-weight: 600;">
                  Option 1: Use the web link
                </p>
                <a href="${webResetUrl}" style="color: #667eea; text-decoration: none; word-break: break-all; font-size: 14px;">
                  ${webResetUrl}
                </a>
              </div>
              `
                  : ""
              }

              <!-- Alternative: Manual Token (primary fallback during testing) -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 16px 0;">
                <p style="margin: 0 0 12px; color: #333333; font-size: 14px; font-weight: 600;">
                  ${
                    webResetUrl ? "Option 2:" : "Alternative:"
                  } Copy this code and paste it in the app
                </p>
                <div style="background-color: #ffffff; border: 2px dashed #667eea; border-radius: 4px; padding: 12px; text-align: center; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #333333; letter-spacing: 1px;">
                  ${resetToken}
                </div>
                <p style="margin: 12px 0 0; color: #666666; font-size: 12px; line-height: 1.5; text-align: center;">
                  <em>Open the app, go to "Reset Password", and paste this code</em>
                </p>
              </div>

              <!-- Expiration Warning -->
              <div style="margin: 24px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  ⏱️ This reset link will expire in <strong>${expirationMinutes} minutes</strong> for your security.
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin: 24px 0 0; color: #666666; font-size: 13px; line-height: 1.5; padding-top: 24px; border-top: 1px solid #e0e0e0;">
                <strong>🛡️ Security Tip:</strong> If you didn't request this password reset, please contact our support team immediately. Someone may be trying to access your account.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; color: #999999; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px;">
                This is an automated email. Please do not reply to this message.
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Kids Learning App. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
