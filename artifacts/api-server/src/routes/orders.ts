import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, cartsTable, productsTable, productColorsTable, productSizesTable, sizesTable, productImagesTable, usersTable } from "@workspace/db";
import { eq, and, desc, count, ilike, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { CreateOrderBody, ListOrdersQueryParams, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams, VerifyPaymentBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: Router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

function formatOrder(o: any) {
  return {
    id: o.id, orderNumber: o.orderNumber, userId: o.userId, status: o.status,
    subtotal: Number(o.subtotal), discountAmount: Number(o.discountAmount),
    shippingCost: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
    paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod ?? null,
    notes: o.notes ?? null,
    createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
  };
}

// List my orders
router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const qp = ListOrdersQueryParams.safeParse(req.query);
  const { page = 1, limit = 10 } = qp.success ? qp.data : {};

  const [{ total }] = await db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.userId, user.id));
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, user.id))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit).offset((page - 1) * limit);

  res.json({ data: orders.map(formatOrder), total, page, limit });
});

// Create order from cart
router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  // Get user's cart
  const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.userId, user.id));
  if (!cart) { res.status(400).json({ error: "Cart not found" }); return; }

  const cartItems = await db
    .select({ item: cartItemsTable, product: productsTable, color: productColorsTable, size: sizesTable, image: productImagesTable })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(productColorsTable, eq(cartItemsTable.colorId, productColorsTable.id))
    .leftJoin(productSizesTable, eq(cartItemsTable.productSizeId, productSizesTable.id))
    .leftJoin(sizesTable, eq(productSizesTable.sizeId, sizesTable.id))
    .leftJoin(productImagesTable, and(eq(productImagesTable.productId, cartItemsTable.productId), eq(productImagesTable.isPrimary, true)))
    .where(eq(cartItemsTable.cartId, cart.id));

  if (cartItems.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }

  const subtotal = cartItems.reduce((s, r) => s + Number(r.product?.price ?? 0) * r.item.quantity, 0);
  const total = subtotal;
  const orderNumber = generateOrderNumber();

  const [order] = await db.insert(ordersTable).values({
    orderNumber, userId: user.id,
    subtotal: subtotal.toString(), discountAmount: "0", shippingCost: "0", tax: "0", total: total.toString(),
    shippingAddress: parsed.data.shippingAddress as any,
    paymentMethod: parsed.data.paymentMethod,
    notes: parsed.data.notes,
  }).returning();

  // Insert order items
  await db.insert(orderItemsTable).values(cartItems.map(r => ({
    orderId: order.id,
    productId: r.item.productId,
    productName: r.product?.name ?? "Unknown",
    productSku: r.product?.sku ?? "N/A",
    productImage: r.image?.imageUrl ?? null,
    selectedColor: r.color?.name ?? null,
    selectedSize: r.size?.label ?? null,
    customMeasurements: r.item.customMeasurements as any,
    quantity: r.item.quantity,
    unitPrice: (Number(r.product?.price ?? 0)).toString(),
    totalPrice: (Number(r.product?.price ?? 0) * r.item.quantity).toString(),
  })));

  // Create Razorpay order (mock if no key)
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? "mock_key";
  const razorpayOrderId = `rzp_${order.id}_${Date.now()}`;

  // Update order with razorpay order id
  await db.update(ordersTable).set({ razorpayOrderId }).where(eq(ordersTable.id, order.id));

  // Clear cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));

  res.status(201).json({
    order: formatOrder({ ...order, razorpayOrderId }),
    razorpayOrderId, razorpayKeyId,
    amount: total * 100, currency: "INR",
  });
});

// Get single order
router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const user = (req as any).user;

  const cond = user.role === "admin"
    ? eq(ordersTable.id, params.data.id)
    : and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, user.id));

  const [order] = await db.select().from(ordersTable).where(cond);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [orderUser] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId));

  res.json({
    ...formatOrder(order),
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayPaymentId: order.razorpayPaymentId ?? null,
    shippingAddress: order.shippingAddress as any,
    user: orderUser ? { id: orderUser.id, fullName: orderUser.fullName, email: orderUser.email, phone: orderUser.phone, role: orderUser.role, isActive: orderUser.isActive, createdAt: orderUser.createdAt.toISOString() } : null,
    items: items.map(item => ({
      id: item.id, orderId: item.orderId, productId: item.productId ?? null,
      productName: item.productName, productSku: item.productSku,
      productImage: item.productImage ?? null, selectedColor: item.selectedColor ?? null,
      selectedSize: item.selectedSize ?? null, customMeasurements: (item.customMeasurements as any) ?? null,
      quantity: item.quantity, unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice),
    })),
  });
});

// Update order status (admin)
router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status as any }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

// Verify payment
router.post("/orders/verify-payment", requireAuth, async (req, res): Promise<void> => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

  if (razorpaySecret) {
    const expectedSig = crypto.createHmac("sha256", razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
    if (expectedSig !== razorpaySignature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }
  }

  const [order] = await db.update(ordersTable).set({
    paymentStatus: "paid", razorpayPaymentId, razorpaySignature, status: "confirmed",
  }).where(eq(ordersTable.id, orderId)).returning();

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

export default router;
