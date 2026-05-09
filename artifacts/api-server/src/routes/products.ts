import { Router } from "express";
import { db, productsTable, productImagesTable, productColorsTable, productSizesTable, productSectionsTable, categoriesTable, sizesTable, reviewsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, desc, asc, count, sql } from "drizzle-orm";
import { requireAdmin, optionalAuth } from "../lib/auth";
import {
  CreateProductBody, UpdateProductBody, UpdateProductParams, DeleteProductParams, GetProductParams,
  ListProductsQueryParams,
  AddProductImageBody, AddProductImageParams, DeleteProductImageParams,
  AddProductColorBody, AddProductColorParams, DeleteProductColorParams,
  AddProductSizeBody, AddProductSizeParams, UpdateProductSizeBody, UpdateProductSizeParams, DeleteProductSizeParams,
  AddProductSectionBody, AddProductSectionParams, UpdateProductSectionBody, UpdateProductSectionParams, DeleteProductSectionParams,
} from "@workspace/api-zod";

const router: Router = Router();

// List products
router.get("/products", optionalAuth, async (req, res): Promise<void> => {
  const qp = ListProductsQueryParams.safeParse(req.query);
  const { categoryId, featured, search, page = 1, limit = 20 } = qp.success ? qp.data : { categoryId: undefined, featured: undefined, search: undefined, page: 1, limit: 20 };

  const conditions: any[] = [];
  const user = (req as any).user;
  if (!user || user.role !== "admin") conditions.push(eq(productsTable.isActive, true));
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (featured) conditions.push(eq(productsTable.isFeatured, true));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(productsTable).where(whereClause);
  const products = await db
    .select({
      product: productsTable,
      category: categoriesTable,
      primaryImage: productImagesTable,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(productImagesTable, and(eq(productImagesTable.productId, productsTable.id), eq(productImagesTable.isPrimary, true)))
    .where(whereClause)
    .orderBy(desc(productsTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    data: products.map(r => formatProduct(r.product, r.category, r.primaryImage?.imageUrl ?? null)),
    total,
    page,
    limit,
  });
});

// Get single product with all details
router.get("/products/:id", optionalAuth, async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .select({ product: productsTable, category: categoriesTable })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!row) { res.status(404).json({ error: "Product not found" }); return; }

  const [images, colors, sizes, sections, reviews] = await Promise.all([
    db.select().from(productImagesTable).where(eq(productImagesTable.productId, params.data.id)).orderBy(asc(productImagesTable.sortOrder)),
    db.select().from(productColorsTable).where(eq(productColorsTable.productId, params.data.id)).orderBy(asc(productColorsTable.sortOrder)),
    db.select({ ps: productSizesTable, size: sizesTable }).from(productSizesTable)
      .leftJoin(sizesTable, eq(productSizesTable.sizeId, sizesTable.id))
      .where(eq(productSizesTable.productId, params.data.id))
      .orderBy(asc(sizesTable.sortOrder)),
    db.select().from(productSectionsTable).where(eq(productSectionsTable.productId, params.data.id)).orderBy(asc(productSectionsTable.sortOrder)),
    db.select({ review: reviewsTable, user: usersTable }).from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(and(eq(reviewsTable.productId, params.data.id), eq(reviewsTable.isApproved, true))),
  ]);

  res.json({
    ...formatProduct(row.product, row.category, images.find(i => i.isPrimary)?.imageUrl ?? images[0]?.imageUrl ?? null),
    images: images.map(formatImage),
    colors: colors.map(c => ({ id: c.id, productId: c.productId, name: c.name, hexCode: c.hexCode, sortOrder: c.sortOrder, isAvailable: c.isAvailable })),
    sizes: sizes.map(s => ({
      id: s.ps.id, productId: s.ps.productId, sizeId: s.ps.sizeId,
      size: s.size ? { id: s.size.id, label: s.size.label, bustRange: s.size.bustRange, waistRange: s.size.waistRange, hipRange: s.size.hipRange, heightRange: s.size.heightRange, sortOrder: s.size.sortOrder, isActive: s.size.isActive } : null,
      stockQuantity: s.ps.stockQuantity, isAvailable: s.ps.isAvailable,
    })),
    sections: sections.map(s => ({ id: s.id, productId: s.productId, title: s.title, content: s.content, sortOrder: s.sortOrder })),
    reviews: reviews.map(r => ({
      id: r.review.id, productId: r.review.productId, userId: r.review.userId,
      userName: r.user?.fullName ?? null, rating: r.review.rating,
      title: r.review.title ?? null, body: r.review.body ?? null,
      isApproved: r.review.isApproved, createdAt: r.review.createdAt.toISOString(),
    })),
  });
});

// Create product
router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.insert(productsTable).values(parsed.data as any).returning();
  res.status(201).json(formatProduct(product, null, null));
});

// Update product
router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.update(productsTable).set(parsed.data as any).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(formatProduct(product, null, null));
});

// Delete product
router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

// Add product image
router.post("/products/:id/images", requireAdmin, async (req, res): Promise<void> => {
  const params = AddProductImageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddProductImageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  if (parsed.data.isPrimary) {
    await db.update(productImagesTable).set({ isPrimary: false }).where(eq(productImagesTable.productId, params.data.id));
  }
  const [img] = await db.insert(productImagesTable).values({ ...parsed.data, productId: params.data.id }).returning();
  res.status(201).json(formatImage(img));
});

// Delete product image
router.delete("/products/:id/images/:imageId", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductImageParams.safeParse({ id: Number(req.params.id), imageId: Number(req.params.imageId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  await db.delete(productImagesTable).where(and(eq(productImagesTable.id, params.data.imageId), eq(productImagesTable.productId, params.data.id)));
  res.sendStatus(204);
});

// Add product color
router.post("/products/:id/colors", requireAdmin, async (req, res): Promise<void> => {
  const params = AddProductColorParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddProductColorBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [color] = await db.insert(productColorsTable).values({ ...parsed.data, productId: params.data.id }).returning();
  res.status(201).json({ id: color.id, productId: color.productId, name: color.name, hexCode: color.hexCode, sortOrder: color.sortOrder, isAvailable: color.isAvailable });
});

// Delete product color
router.delete("/products/:id/colors/:colorId", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductColorParams.safeParse({ id: Number(req.params.id), colorId: Number(req.params.colorId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  await db.delete(productColorsTable).where(and(eq(productColorsTable.id, params.data.colorId), eq(productColorsTable.productId, params.data.id)));
  res.sendStatus(204);
});

// Add product size
router.post("/products/:id/sizes", requireAdmin, async (req, res): Promise<void> => {
  const params = AddProductSizeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddProductSizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ps] = await db.insert(productSizesTable).values({ ...parsed.data, productId: params.data.id }).returning();
  const [size] = await db.select().from(sizesTable).where(eq(sizesTable.id, ps.sizeId));
  res.status(201).json({ id: ps.id, productId: ps.productId, sizeId: ps.sizeId, size: size ?? null, stockQuantity: ps.stockQuantity, isAvailable: ps.isAvailable });
});

// Update product size
router.patch("/products/:id/sizes/:productSizeId", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductSizeParams.safeParse({ id: Number(req.params.id), productSizeId: Number(req.params.productSizeId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  const parsed = UpdateProductSizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ps] = await db.update(productSizesTable).set(parsed.data).where(and(eq(productSizesTable.id, params.data.productSizeId), eq(productSizesTable.productId, params.data.id))).returning();
  if (!ps) { res.status(404).json({ error: "Not found" }); return; }
  const [size] = await db.select().from(sizesTable).where(eq(sizesTable.id, ps.sizeId));
  res.json({ id: ps.id, productId: ps.productId, sizeId: ps.sizeId, size: size ?? null, stockQuantity: ps.stockQuantity, isAvailable: ps.isAvailable });
});

// Delete product size
router.delete("/products/:id/sizes/:productSizeId", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductSizeParams.safeParse({ id: Number(req.params.id), productSizeId: Number(req.params.productSizeId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  await db.delete(productSizesTable).where(and(eq(productSizesTable.id, params.data.productSizeId), eq(productSizesTable.productId, params.data.id)));
  res.sendStatus(204);
});

// Add product section
router.post("/products/:id/sections", requireAdmin, async (req, res): Promise<void> => {
  const params = AddProductSectionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddProductSectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [section] = await db.insert(productSectionsTable).values({ ...parsed.data, productId: params.data.id }).returning();
  res.status(201).json({ id: section.id, productId: section.productId, title: section.title, content: section.content, sortOrder: section.sortOrder });
});

// Update product section
router.patch("/products/:id/sections/:sectionId", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductSectionParams.safeParse({ id: Number(req.params.id), sectionId: Number(req.params.sectionId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  const parsed = UpdateProductSectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [section] = await db.update(productSectionsTable).set(parsed.data).where(and(eq(productSectionsTable.id, params.data.sectionId), eq(productSectionsTable.productId, params.data.id))).returning();
  if (!section) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ id: section.id, productId: section.productId, title: section.title, content: section.content, sortOrder: section.sortOrder });
});

// Delete product section
router.delete("/products/:id/sections/:sectionId", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductSectionParams.safeParse({ id: Number(req.params.id), sectionId: Number(req.params.sectionId) });
  if (!params.success) { res.status(400).json({ error: "Invalid params" }); return; }
  await db.delete(productSectionsTable).where(and(eq(productSectionsTable.id, params.data.sectionId), eq(productSectionsTable.productId, params.data.id)));
  res.sendStatus(204);
});

function formatProduct(p: any, cat: any, primaryImage: string | null) {
  return {
    id: p.id, name: p.name, slug: p.slug,
    description: p.description ?? null, shortDescription: p.shortDescription ?? null,
    sku: p.sku, price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    categoryId: p.categoryId ?? null,
    material: p.material ?? null, styleTag: p.styleTag ?? null, deliveryDays: p.deliveryDays ?? null,
    allowCustomSize: p.allowCustomSize, isActive: p.isActive, isFeatured: p.isFeatured,
    lowStockThreshold: p.lowStockThreshold,
    createdAt: p.createdAt.toISOString(),
    primaryImage,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? null, imageUrl: cat.imageUrl ?? null, cloudinaryPublicId: cat.cloudinaryPublicId ?? null, sortOrder: cat.sortOrder, isActive: cat.isActive } : null,
  };
}

function formatImage(img: any) {
  return {
    id: img.id, productId: img.productId, colorId: img.colorId ?? null,
    imageUrl: img.imageUrl, cloudinaryPublicId: img.cloudinaryPublicId ?? null,
    altText: img.altText ?? null, sortOrder: img.sortOrder, isPrimary: img.isPrimary,
  };
}

export default router;
