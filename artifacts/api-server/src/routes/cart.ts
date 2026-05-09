import { Router } from "express";
import { db, cartsTable, cartItemsTable, productsTable, productColorsTable, productSizesTable, sizesTable, productImagesTable } from "@workspace/db";
import { eq, and, sum, count } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../lib/auth";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveCartItemParams } from "@workspace/api-zod";

const router: Router = Router();

async function getOrCreateCart(req: any): Promise<number> {
  const user = req.user;
  const sessionId = req.headers["x-session-id"] as string | undefined;

  if (user) {
    const [existing] = await db.select().from(cartsTable).where(eq(cartsTable.userId, user.id));
    if (existing) return existing.id;
    const [cart] = await db.insert(cartsTable).values({ userId: user.id }).returning();
    return cart.id;
  } else {
    const sid = sessionId ?? "guest";
    const [existing] = await db.select().from(cartsTable).where(eq(cartsTable.sessionId, sid));
    if (existing) return existing.id;
    const [cart] = await db.insert(cartsTable).values({ sessionId: sid }).returning();
    return cart.id;
  }
}

async function buildCartResponse(cartId: number) {
  const items = await db
    .select({ item: cartItemsTable, product: productsTable, color: productColorsTable, productSize: productSizesTable, size: sizesTable, image: productImagesTable })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(productColorsTable, eq(cartItemsTable.colorId, productColorsTable.id))
    .leftJoin(productSizesTable, eq(cartItemsTable.productSizeId, productSizesTable.id))
    .leftJoin(sizesTable, eq(productSizesTable.sizeId, sizesTable.id))
    .leftJoin(productImagesTable, and(eq(productImagesTable.productId, cartItemsTable.productId), eq(productImagesTable.isPrimary, true)))
    .where(eq(cartItemsTable.cartId, cartId));

  let subtotal = 0;
  const formattedItems = items.map(r => {
    const price = r.product ? Number(r.product.price) : 0;
    const itemTotal = price * r.item.quantity;
    subtotal += itemTotal;
    return {
      id: r.item.id, cartId: r.item.cartId, productId: r.item.productId,
      product: r.product ? {
        id: r.product.id, name: r.product.name, slug: r.product.slug,
        description: r.product.description ?? null, shortDescription: r.product.shortDescription ?? null,
        sku: r.product.sku, price: Number(r.product.price),
        compareAtPrice: r.product.compareAtPrice ? Number(r.product.compareAtPrice) : null,
        categoryId: r.product.categoryId ?? null, material: r.product.material ?? null,
        styleTag: r.product.styleTag ?? null, deliveryDays: r.product.deliveryDays ?? null,
        allowCustomSize: r.product.allowCustomSize, isActive: r.product.isActive,
        isFeatured: r.product.isFeatured, lowStockThreshold: r.product.lowStockThreshold,
        createdAt: r.product.createdAt.toISOString(), primaryImage: r.image?.imageUrl ?? null, category: null,
      } : null,
      colorId: r.item.colorId ?? null, colorName: r.color?.name ?? null,
      productSizeId: r.item.productSizeId ?? null, sizeLabel: r.size?.label ?? null,
      customMeasurements: (r.item.customMeasurements as any) ?? null,
      quantity: r.item.quantity,
    };
  });

  return { id: cartId, items: formattedItems, itemCount: formattedItems.reduce((s, i) => s + i.quantity, 0), subtotal };
}

router.get("/cart", optionalAuth, async (req, res): Promise<void> => {
  const cartId = await getOrCreateCart(req);
  res.json(await buildCartResponse(cartId));
});

router.post("/cart/items", optionalAuth, async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const cartId = await getOrCreateCart(req);

  const existing = await db.select().from(cartItemsTable).where(
    and(eq(cartItemsTable.cartId, cartId), eq(cartItemsTable.productId, parsed.data.productId))
  );

  if (existing.length > 0 && !parsed.data.colorId && !parsed.data.productSizeId) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + parsed.data.quantity }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ cartId, ...parsed.data });
  }

  res.status(201).json(await buildCartResponse(cartId));
});

router.patch("/cart/items/:itemId", optionalAuth, async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse({ itemId: Number(req.params.itemId) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const cartId = await getOrCreateCart(req);

  await db.update(cartItemsTable).set(parsed.data as any).where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, cartId)));
  res.json(await buildCartResponse(cartId));
});

router.delete("/cart/items/:itemId", optionalAuth, async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse({ itemId: Number(req.params.itemId) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const cartId = await getOrCreateCart(req);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, cartId)));
  res.json(await buildCartResponse(cartId));
});

router.delete("/cart/clear", optionalAuth, async (req, res): Promise<void> => {
  const cartId = await getOrCreateCart(req);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
  res.json(await buildCartResponse(cartId));
});

export default router;
