import { db, ordersTable, cartItemsTable, cartsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function clearUserCart(userId: number): Promise<void> {
  const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.userId, userId));
  if (!cart) return;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
}

export async function markOrderPaid(
  orderId: number,
  razorpayPaymentId: string,
  razorpaySignature?: string | null,
) {
  const [order] = await db
    .update(ordersTable)
    .set({
      paymentStatus: "paid",
      razorpayPaymentId,
      ...(razorpaySignature != null ? { razorpaySignature } : {}),
      status: "confirmed",
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (order) {
    await clearUserCart(order.userId);
  }

  return order ?? null;
}

export async function markOrderByRazorpayOrderId(
  razorpayOrderId: string,
  razorpayPaymentId: string,
) {
  const [existing] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.razorpayOrderId, razorpayOrderId));

  if (!existing) return null;
  if (existing.paymentStatus === "paid") return existing;

  return markOrderPaid(existing.id, razorpayPaymentId);
}
