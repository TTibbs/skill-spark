import { resend } from "./resend";
import { generatePasswordResetEmail } from "./reset";

interface SendResetEmailParams {
  email: string;
  username: string;
  resetToken: string;
}

export async function sendResetEmail({
  email,
  username,
  resetToken,
}: SendResetEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (process.env.NODE_ENV === "test") {
      return { success: true };
    }

    // Get environment variables with defaults for development
    const appScheme = process.env.APP_SCHEME || "kidslearningapp";
    const webUrl = process.env.WEB_URL; // Optional - may not exist during internal testing
    const expirationMinutes = 15; // Token expiration time

    // Construct the deep link URL (opens the app if installed)
    const deepLinkUrl = `${appScheme}://reset-password?token=${resetToken}`;

    // Construct the web reset URL (only if WEB_URL is configured)
    const webResetUrl = webUrl
      ? `${webUrl}/reset-password?token=${resetToken}`
      : null;

    // Generate the HTML email
    const htmlContent = generatePasswordResetEmail({
      username,
      resetToken,
      deepLinkUrl,
      webResetUrl,
      expirationMinutes,
    });

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Kids Learning App <tward5824@gmail.com>",
      to: email,
      subject: "Reset Your Password - Kids Learning App",
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending reset email:", error);
      return { success: false, error: error.message };
    }

    console.log("Reset email sent successfully:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("Unexpected error sending reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
