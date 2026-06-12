import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Read a user-facing message from an API error (ApiError from api-client-react). */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object" && "error" in data) {
      const apiError = (data as { error?: unknown }).error;
      if (typeof apiError === "string" && apiError.trim()) return apiError;
    }
    const message = (err as Error).message;
    if (typeof message === "string") {
      const fromHttp = message.match(/^HTTP \d+[^:]*:\s*(.+)$/s);
      if (fromHttp?.[1]?.trim()) return fromHttp[1].trim();
    }
  }
  return fallback;
}

/** URL-safe slug from display text (strips emoji and special characters). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
