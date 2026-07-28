import crypto from "crypto";

export const REFRESH_TOKEN_COOKIE_NAME = "skill_spark_refresh_token";

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateSecureToken = (): string =>
  crypto.randomBytes(32).toString("base64url");

export const getRefreshTokenFromRequest = (req: {
  body?: unknown;
  headers: { cookie?: string | string[] };
}): string | null => {
  const body = req.body as { refreshToken?: unknown } | undefined;
  if (typeof body?.refreshToken === "string" && body.refreshToken.length > 0) {
    return body.refreshToken;
  }

  const cookieHeader = req.headers.cookie;
  const cookieText = Array.isArray(cookieHeader)
    ? cookieHeader.join("; ")
    : cookieHeader;

  if (!cookieText) {
    return null;
  }

  const cookies = cookieText.split(";").map((cookie) => cookie.trim());
  const refreshCookie = cookies.find((cookie) =>
    cookie.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`)
  );

  if (!refreshCookie) {
    return null;
  }

  return decodeURIComponent(refreshCookie.split("=").slice(1).join("="));
};

export const getRefreshTokenExpiryDate = (refreshToken: string): Date => {
  const decoded = JSON.parse(
    Buffer.from(refreshToken.split(".")[1] || "", "base64url").toString("utf8")
  ) as { exp?: unknown };

  if (typeof decoded.exp === "number") {
    return new Date(decoded.exp * 1000);
  }

  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};
