import { Router } from "express";
import { db, contactMessagesTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { verifyToken } from "../lib/auth";
import { requireAdmin } from "../lib/auth";
import { CreateContactMessageBody, ListAdminContactMessagesQueryParams } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: Router = Router();

router.post("/contact-messages", async (req, res): Promise<void> => {
  try {
    const parsed = CreateContactMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { fullName, email, phone, message } = parsed.data;
    if (message.trim().length < 10) {
      res.status(400).json({ error: "Message must be at least 10 characters" });
      return;
    }

    let userId: number | null = null;
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const payload = verifyToken(header.slice(7));
        const [u] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
        if (u?.isActive) userId = u.id;
      } catch {
        /* guest */
      }
    }

    const inserted = await db
      .insert(contactMessagesTable)
      .values({
        userId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() ? phone.trim() : null,
        message: message.trim(),
      })
      .returning();

    const row = inserted[0];
    if (!row) {
      res.status(500).json({ error: "Insert did not return a row" });
      return;
    }

    res.status(201).json({
      id: row.id,
      userId: row.userId,
      accountEmail: null,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone ?? null,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
    const pgCode = e.code ?? e.cause?.code;
    const msg = e.message ?? e.cause?.message ?? "";
    logger.error({ err: e, pgCode }, "POST /contact-messages failed");
    const missingTable =
      pgCode === "42P01" || /relation ["']?contact_messages["']? does not exist/i.test(msg);
    if (missingTable) {
      res.status(503).json({
        error:
          'Missing database table "contact_messages". From the repo root run: pnpm exec dotenv -e .env -- pnpm --filter @workspace/db run push (or push-force).',
      });
      return;
    }
    const detail =
      process.env.NODE_ENV === "development" && msg ? msg : "Could not save your message. Try again later.";
    res.status(500).json({ error: detail });
  }
});

router.get("/admin/contact-messages", requireAdmin, async (req, res): Promise<void> => {
  const qp = ListAdminContactMessagesQueryParams.safeParse(req.query);
  const page = qp.success ? Math.max(1, qp.data.page ?? 1) : 1;

  const [{ total }] = await db.select({ total: count() }).from(contactMessagesTable);
  const rows = await db
    .select({ row: contactMessagesTable, userEmail: usersTable.email })
    .from(contactMessagesTable)
    .leftJoin(usersTable, eq(contactMessagesTable.userId, usersTable.id))
    .orderBy(desc(contactMessagesTable.createdAt))
    .limit(20)
    .offset((page - 1) * 20);

  res.json({
    data: rows.map((r) => ({
      id: r.row.id,
      userId: r.row.userId,
      accountEmail: r.userEmail ?? null,
      fullName: r.row.fullName,
      email: r.row.email,
      phone: r.row.phone ?? null,
      message: r.row.message,
      createdAt: r.row.createdAt.toISOString(),
    })),
    total,
    page,
    limit: 20,
  });
});

export default router;
