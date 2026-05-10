import { Router } from "express";
import {
  db,
  usersTable,
  categoriesTable,
  customOrderRequestsTable,
} from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { verifyToken } from "../lib/auth";
import { requireAdmin } from "../lib/auth";
import { createCloudinaryUploadSignature } from "../lib/cloudinary-upload-signature";
import {
  CreateCustomOrderRequestBody,
  ListAdminCustomOrderRequestsQueryParams,
  UpdateAdminCustomOrderRequestParams,
  UpdateAdminCustomOrderRequestBody,
} from "@workspace/api-zod";

const router: Router = Router();

/** Public: signed upload for custom-order inspiration images (folder scoped). */
router.get("/upload/custom-order-signature", (_req, res): void => {
  const signed = createCloudinaryUploadSignature("custom-orders");
  if (!signed) {
    res.status(503).json({
      error:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
    });
    return;
  }
  res.json(signed);
});

router.post("/custom-order-requests", async (req, res): Promise<void> => {
  const parsed = CreateCustomOrderRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const b = parsed.data;
  const hasImage = Boolean(b.inspirationImageUrl?.trim());
  const hasText = Boolean(b.description?.trim());
  const hasMeasures = [b.bust, b.waist, b.hip, b.height].some((x) => x && String(x).trim() !== "");
  const hasColors = Boolean(b.colors?.trim());
  if (!hasImage && !hasText && !hasMeasures && !hasColors) {
    res.status(400).json({ error: "Add a description, image, measurements, or colours." });
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

  if (b.categoryId != null) {
    const [cat] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.id, b.categoryId));
    if (!cat) {
      res.status(400).json({ error: "Invalid category" });
      return;
    }
  }

  const [row] = await db
    .insert(customOrderRequestsTable)
    .values({
      userId,
      categoryId: b.categoryId ?? null,
      inspirationImageUrl: b.inspirationImageUrl?.trim() || null,
      inspirationCloudinaryPublicId: b.inspirationCloudinaryPublicId?.trim() || null,
      description: b.description?.trim() || null,
      bust: b.bust?.trim() || null,
      waist: b.waist?.trim() || null,
      hip: b.hip?.trim() || null,
      height: b.height?.trim() || null,
      colors: b.colors?.trim() || null,
    })
    .returning();

  const [u] = row.userId != null ? await db.select().from(usersTable).where(eq(usersTable.id, row.userId)) : [null];
  const [cat] =
    row.categoryId != null
      ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, row.categoryId))
      : [null];

  res.status(201).json({
    id: row.id,
    userId: row.userId,
    userEmail: u?.email ?? null,
    userName: u?.fullName ?? null,
    categoryId: row.categoryId,
    categoryName: cat?.name ?? null,
    inspirationImageUrl: row.inspirationImageUrl ?? null,
    inspirationCloudinaryPublicId: row.inspirationCloudinaryPublicId ?? null,
    description: row.description ?? null,
    bust: row.bust ?? null,
    waist: row.waist ?? null,
    hip: row.hip ?? null,
    height: row.height ?? null,
    colors: row.colors ?? null,
    status: row.status,
    adminNotes: row.adminNotes ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.get("/admin/custom-order-requests", requireAdmin, async (req, res): Promise<void> => {
  const qp = ListAdminCustomOrderRequestsQueryParams.safeParse(req.query);
  const page = qp.success ? Math.max(1, qp.data.page ?? 1) : 1;
  const status = qp.success ? qp.data.status : undefined;
  const statusFilter = status ? eq(customOrderRequestsTable.status, status) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(customOrderRequestsTable).where(statusFilter);
  const rows = await db
    .select({
      row: customOrderRequestsTable,
      categoryName: categoriesTable.name,
      userEmail: usersTable.email,
      userName: usersTable.fullName,
    })
    .from(customOrderRequestsTable)
    .leftJoin(categoriesTable, eq(customOrderRequestsTable.categoryId, categoriesTable.id))
    .leftJoin(usersTable, eq(customOrderRequestsTable.userId, usersTable.id))
    .where(statusFilter)
    .orderBy(desc(customOrderRequestsTable.createdAt))
    .limit(20)
    .offset((page - 1) * 20);

  res.json({
    data: rows.map((r) => ({
      id: r.row.id,
      userId: r.row.userId,
      userEmail: r.userEmail ?? null,
      userName: r.userName ?? null,
      categoryId: r.row.categoryId,
      categoryName: r.categoryName ?? null,
      inspirationImageUrl: r.row.inspirationImageUrl ?? null,
      inspirationCloudinaryPublicId: r.row.inspirationCloudinaryPublicId ?? null,
      description: r.row.description ?? null,
      bust: r.row.bust ?? null,
      waist: r.row.waist ?? null,
      hip: r.row.hip ?? null,
      height: r.row.height ?? null,
      colors: r.row.colors ?? null,
      status: r.row.status,
      adminNotes: r.row.adminNotes ?? null,
      createdAt: r.row.createdAt.toISOString(),
      updatedAt: r.row.updatedAt.toISOString(),
    })),
    total,
    page,
    limit: 20,
  });
});

router.patch("/admin/custom-order-requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminCustomOrderRequestParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateAdminCustomOrderRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.adminNotes !== undefined) patch.adminNotes = parsed.data.adminNotes;

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [row] = await db
    .update(customOrderRequestsTable)
    .set(patch as any)
    .where(eq(customOrderRequestsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [u] = row.userId != null ? await db.select().from(usersTable).where(eq(usersTable.id, row.userId)) : [null];
  const [cat] =
    row.categoryId != null
      ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, row.categoryId))
      : [null];

  res.json({
    id: row.id,
    userId: row.userId,
    userEmail: u?.email ?? null,
    userName: u?.fullName ?? null,
    categoryId: row.categoryId,
    categoryName: cat?.name ?? null,
    inspirationImageUrl: row.inspirationImageUrl ?? null,
    inspirationCloudinaryPublicId: row.inspirationCloudinaryPublicId ?? null,
    description: row.description ?? null,
    bust: row.bust ?? null,
    waist: row.waist ?? null,
    hip: row.hip ?? null,
    height: row.height ?? null,
    colors: row.colors ?? null,
    status: row.status,
    adminNotes: row.adminNotes ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export default router;
