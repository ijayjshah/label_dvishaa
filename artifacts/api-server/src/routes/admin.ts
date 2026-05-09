import { Router } from "express";
import { db, usersTable, ordersTable, productsTable, productImagesTable } from "@workspace/db";
import { eq, desc, count, sum, ilike, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { ListUsersQueryParams, GetUserParams, ToggleUserActiveParams, ListAdminOrdersQueryParams } from "@workspace/api-zod";

const router: Router = Router();

// Dashboard stats
router.get("/admin/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [[{ totalUsers }], [{ totalOrders }], revenueResult, [{ pendingOrders }], [{ todayOrders }], recentOrders, topProducts] = await Promise.all([
    db.select({ totalUsers: count() }).from(usersTable).where(eq(usersTable.role, "customer")),
    db.select({ totalOrders: count() }).from(ordersTable),
    db.select({ totalRevenue: sum(ordersTable.total) }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid")),
    db.select({ pendingOrders: count() }).from(ordersTable).where(eq(ordersTable.status, "pending")),
    db.select({ todayOrders: count() }).from(ordersTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    db.select({ product: productsTable, image: productImagesTable })
      .from(productsTable)
      .leftJoin(productImagesTable, and(eq(productImagesTable.productId, productsTable.id), eq(productImagesTable.isPrimary, true)))
      .where(eq(productsTable.isFeatured, true)).limit(5),
  ]);

  res.json({
    totalUsers, totalOrders,
    totalRevenue: Number(revenueResult[0]?.totalRevenue ?? 0),
    pendingOrders, todayOrders: todayOrders ?? 0, todayRevenue: 0,
    recentOrders: recentOrders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, userId: o.userId, status: o.status,
      subtotal: Number(o.subtotal), discountAmount: Number(o.discountAmount),
      shippingCost: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
      paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod ?? null, notes: o.notes ?? null,
      createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
    })),
    topProducts: topProducts.map(r => ({
      id: r.product.id, name: r.product.name, slug: r.product.slug,
      description: r.product.description ?? null, shortDescription: r.product.shortDescription ?? null,
      sku: r.product.sku, price: Number(r.product.price),
      compareAtPrice: r.product.compareAtPrice ? Number(r.product.compareAtPrice) : null,
      categoryId: r.product.categoryId ?? null, material: r.product.material ?? null,
      styleTag: r.product.styleTag ?? null, deliveryDays: r.product.deliveryDays ?? null,
      allowCustomSize: r.product.allowCustomSize, isActive: r.product.isActive, isFeatured: r.product.isFeatured,
      lowStockThreshold: r.product.lowStockThreshold, createdAt: r.product.createdAt.toISOString(),
      primaryImage: r.image?.imageUrl ?? null, category: null,
    })),
  });
});

// List users
router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const qp = ListUsersQueryParams.safeParse(req.query);
  const { page = 1, search } = qp.success ? qp.data : {};

  const condition = search ? ilike(usersTable.fullName, `%${search}%`) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(usersTable).where(condition);
  const users = await db.select().from(usersTable).where(condition).orderBy(desc(usersTable.createdAt)).limit(20).offset(((page ?? 1) - 1) * 20);

  res.json({
    data: users.map(u => ({ id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role, isActive: u.isActive, createdAt: u.createdAt.toISOString() })),
    total, page: page ?? 1, limit: 20,
  });
});

// Get user with orders
router.get("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, user.id)).orderBy(desc(ordersTable.createdAt));

  res.json({
    id: user.id, fullName: user.fullName, email: user.email, phone: user.phone,
    role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString(),
    orders: orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, userId: o.userId, status: o.status,
      subtotal: Number(o.subtotal), discountAmount: Number(o.discountAmount),
      shippingCost: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
      paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod ?? null, notes: o.notes ?? null,
      createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
    })),
  });
});

// Toggle user active
router.patch("/admin/users/:id/toggle-active", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleUserActiveParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const [updated] = await db.update(usersTable).set({ isActive: !user.isActive }).where(eq(usersTable.id, params.data.id)).returning();
  res.json({ id: updated.id, fullName: updated.fullName, email: updated.email, phone: updated.phone, role: updated.role, isActive: updated.isActive, createdAt: updated.createdAt.toISOString() });
});

// Admin orders list
router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const qp = ListAdminOrdersQueryParams.safeParse(req.query);
  const { page = 1, status, search } = qp.success ? qp.data : {};
  const conditions: any[] = [];
  if (status) conditions.push(eq(ordersTable.status, status as any));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(ordersTable).where(whereClause);
  const orders = await db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(20).offset(((page ?? 1) - 1) * 20);

  res.json({
    data: orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, userId: o.userId, status: o.status,
      subtotal: Number(o.subtotal), discountAmount: Number(o.discountAmount),
      shippingCost: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
      paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod ?? null, notes: o.notes ?? null,
      createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
    })),
    total, page: page ?? 1, limit: 20,
  });
});

// Upload signature
router.get("/upload/signature", requireAdmin, (_req, res): void => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "demo";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "demo";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "label-dvisha";

  let signature = "";
  if (apiSecret) {
    const crypto = require("crypto");
    signature = crypto.createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
  }

  res.json({ signature, timestamp, cloudName, apiKey, folder });
});

export default router;
