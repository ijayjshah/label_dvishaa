import { Router } from "express";
import { db, galleryUploadsTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { UploadGalleryBody, ListGalleryQueryParams, ApproveGalleryParams, DeleteGalleryParams } from "@workspace/api-zod";

const router: Router = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  const qp = ListGalleryQueryParams.safeParse(req.query);
  const { page = 1, approved } = qp.success ? qp.data : { page: 1, approved: undefined };

  const showApproved = approved !== false;
  const condition = showApproved ? eq(galleryUploadsTable.isApproved, true) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(galleryUploadsTable).where(condition);
  const items = await db
    .select({ item: galleryUploadsTable, user: usersTable })
    .from(galleryUploadsTable)
    .leftJoin(usersTable, eq(galleryUploadsTable.userId, usersTable.id))
    .where(condition)
    .orderBy(desc(galleryUploadsTable.createdAt))
    .limit(20).offset(((page ?? 1) - 1) * 20);

  res.json({
    data: items.map(r => ({
      id: r.item.id, userId: r.item.userId, userName: r.user?.fullName ?? null,
      imageUrl: r.item.imageUrl, cloudinaryPublicId: r.item.cloudinaryPublicId ?? null,
      caption: r.item.caption ?? null, isApproved: r.item.isApproved,
      createdAt: r.item.createdAt.toISOString(),
    })),
    total, page: page ?? 1, limit: 20,
  });
});

router.post("/gallery", requireAuth, async (req, res): Promise<void> => {
  const parsed = UploadGalleryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const user = (req as any).user;

  const [item] = await db.insert(galleryUploadsTable).values({ ...parsed.data, userId: user.id }).returning();
  res.status(201).json({ id: item.id, userId: item.userId, userName: user.fullName, imageUrl: item.imageUrl, cloudinaryPublicId: item.cloudinaryPublicId ?? null, caption: item.caption ?? null, isApproved: item.isApproved, createdAt: item.createdAt.toISOString() });
});

router.patch("/gallery/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const params = ApproveGalleryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [item] = await db.update(galleryUploadsTable).set({ isApproved: true }).where(eq(galleryUploadsTable.id, params.data.id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ id: item.id, userId: item.userId, userName: null, imageUrl: item.imageUrl, cloudinaryPublicId: item.cloudinaryPublicId ?? null, caption: item.caption ?? null, isApproved: item.isApproved, createdAt: item.createdAt.toISOString() });
});

router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteGalleryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(galleryUploadsTable).where(eq(galleryUploadsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
