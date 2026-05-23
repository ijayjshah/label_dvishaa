import { setBaseUrl } from "@workspace/api-client-react";

/**
 * In production (e.g. Vercel), set VITE_API_BASE_URL to your API origin only —
 * no trailing slash, no `/api` suffix. Example: https://your-api.onrender.com
 *
 * In local dev, leave unset; Vite proxies `/api` to API_SERVER_URL.
 */
export function configureApiClient() {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return;

  setBaseUrl(raw.replace(/\/+$/, ""));
}
