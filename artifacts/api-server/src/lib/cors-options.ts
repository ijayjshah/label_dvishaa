import type { CorsOptions } from "cors";

/**
 * CORS_ORIGIN:
 * - unset / empty: default cors behavior (permissive; same as before).
 * - "*": reflect request Origin (any origin); enables credentials.
 * - comma-separated URLs: allow only those origins; enables credentials.
 */
export function corsOptionsFromEnv(): CorsOptions {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    return {};
  }

  if (raw === "*") {
    return { origin: true, credentials: true };
  }

  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return {};
  }

  return { origin: origins, credentials: true };
}
