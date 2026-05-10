import { Router } from "express";
import { db, galleryUploadsTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { UploadGalleryBody, DeleteGalleryParams, UpdateGalleryParams, UpdateGalleryBody } from "@workspace/api-zod";

const router: Router = Router();

function parsePage(query: Record<string, unknown>): number {
  const rawPage = query.page;
  return Math.max(1, typeof rawPage === "string" ? Number(rawPage) || 1 : Number(rawPage) || 1);
}

router.get("/gallery", async (req, res, next): Promise<void> => {
  try {
    const page = parsePage(req.query as Record<string, unknown>);

    const [{ total }] = await db.select({ total: count() }).from(galleryUploadsTable);
    const items = await db
      .select({ item: galleryUploadsTable, user: usersTable })
      .from(galleryUploadsTable)
      .leftJoin(usersTable, eq(galleryUploadsTable.userId, usersTable.id))
      .orderBy(desc(galleryUploadsTable.createdAt))
      .limit(20)
      .offset((page - 1) * 20);

    res.json({
      data: items.map((r) => ({
        id: r.item.id,
        userId: r.item.userId,
        userName: r.user?.fullName ?? null,
        imageUrl: r.item.imageUrl,
        cloudinaryPublicId: r.item.cloudinaryPublicId ?? null,
        caption: r.item.caption ?? null,
        createdAt: r.item.createdAt.toISOString(),
      })),
      total,
      page,
      limit: 20,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UploadGalleryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = (req as any).user;

  const [item] = await db
    .insert(galleryUploadsTable)
    .values({
      ...parsed.data,
      userId: user.id,
    })
    .returning();

  res.status(201).json({
    id: item.id,
    userId: item.userId,
    userName: user.fullName,
    imageUrl: item.imageUrl,
    cloudinaryPublicId: item.cloudinaryPublicId ?? null,
    caption: item.caption ?? null,
    createdAt: item.createdAt.toISOString(),
  });
});

router.patch("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateGalleryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateGalleryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.imageUrl !== undefined) patch.imageUrl = parsed.data.imageUrl;
  if (parsed.data.cloudinaryPublicId !== undefined) patch.cloudinaryPublicId = parsed.data.cloudinaryPublicId;
  if (parsed.data.caption !== undefined) patch.caption = parsed.data.caption;

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [item] = await db
    .update(galleryUploadsTable)
    .set(patch as any)
    .where(eq(galleryUploadsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, item.userId));

  res.json({
    id: item.id,
    userId: item.userId,
    userName: u?.fullName ?? null,
    imageUrl: item.imageUrl,
    cloudinaryPublicId: item.cloudinaryPublicId ?? null,
    caption: item.caption ?? null,
    createdAt: item.createdAt.toISOString(),
  });
});

router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteGalleryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(galleryUploadsTable).where(eq(galleryUploadsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
