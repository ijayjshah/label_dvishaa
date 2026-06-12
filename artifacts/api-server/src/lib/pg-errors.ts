type PgErrorLike = {
  code?: string;
  message?: string;
  detail?: string;
  cause?: PgErrorLike;
};

function findPgError(err: unknown): PgErrorLike {
  const e = err as PgErrorLike;
  let cur: PgErrorLike | undefined = e;
  let withCode: PgErrorLike | undefined;
  while (cur) {
    if (cur.code) withCode = cur;
    cur = cur.cause;
  }
  return withCode ?? e;
}

function pgErrorText(err: unknown): string {
  const parts: string[] = [];
  let cur: PgErrorLike | undefined = err as PgErrorLike;
  while (cur) {
    if (cur.message) parts.push(cur.message);
    if (cur.detail) parts.push(cur.detail);
    cur = cur.cause;
  }
  return parts.join(" ");
}

export function uniqueConstraintMessage(err: unknown): string | null {
  const { code } = findPgError(err);
  if (code !== "23505") return null;

  const text = pgErrorText(err);
  if (/products_sku_unique|\(sku\)/i.test(text)) {
    return "A product with this SKU already exists. Each product needs a unique SKU — try a different code (e.g. LD-101).";
  }
  if (/products_slug_unique|\(slug\)/i.test(text)) {
    return "A product with this URL slug already exists. Change the slug or product name.";
  }
  if (/categories_slug_unique/i.test(text)) {
    return "A category with this slug already exists.";
  }
  return "This value is already in use. Please choose a different SKU or slug.";
}

export function dbErrorResponse(err: unknown): { status: number; error: string } | null {
  const unique = uniqueConstraintMessage(err);
  if (unique) return { status: 409, error: unique };

  const { code } = findPgError(err);
  if (code === "23503") {
    return {
      status: 400,
      error: "The selected category does not exist. Pick a category from the list and try again.",
    };
  }
  if (code === "23502") {
    return {
      status: 400,
      error: "A required field is missing. Fill in name, price, and SKU.",
    };
  }
  return null;
}
