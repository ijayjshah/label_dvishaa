import { Router } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { CreateBannerBody, UpdateBannerBody, UpdateBannerParams, DeleteBannerParams } from "@workspace/api-zod";

const router: Router = Router();

router.get("/banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(bannersTable).where(eq(bannersTable.isActive, true)).orderBy(asc(bannersTable.sortOrder));
  res.json(banners.map(fmt));
});

router.post("/banners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [b] = await db.insert(bannersTable).values(parsed.data).returning();
  res.status(201).json(fmt(b));
});

router.patch("/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBannerParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [b] = await db.update(bannersTable).set(parsed.data).where(eq(bannersTable.id, params.data.id)).returning();
  if (!b) { res.status(404).json({ error: "Banner not found" }); return; }
  res.json(fmt(b));
});

router.delete("/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBannerParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(bannersTable).where(eq(bannersTable.id, params.data.id));
  res.sendStatus(204);
});

function fmt(b: any) {
  return {
    id: b.id, title: b.title, subtitle: b.subtitle ?? null, imageUrl: b.imageUrl,
    cloudinaryPublicId: b.cloudinaryPublicId ?? null, linkUrl: b.linkUrl ?? null,
    position: b.position, sortOrder: b.sortOrder, isActive: b.isActive,
  };
}

export default router;
