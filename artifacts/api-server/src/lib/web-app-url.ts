/**
 * Base URL of the SPA (Vite in dev, or your deployed frontend).
 * Set WEB_APP_URL in .env for an explicit value (recommended in production).
 */
export function getWebAppBaseUrl(): string {
  const fromEnv = process.env.WEB_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  const port = process.env.FRONTEND_PORT ?? "5173";
  return `http://127.0.0.1:${port}`;
}
