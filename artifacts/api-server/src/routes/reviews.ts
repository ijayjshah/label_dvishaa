import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { CreateReviewBody, CreateReviewParams, ApproveReviewParams, DeleteReviewParams, ListProductReviewsParams } from "@workspace/api-zod";

const router: Router = Router();

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const params = ListProductReviewsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const reviews = await db
    .select({ review: reviewsTable, user: usersTable })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(and(eq(reviewsTable.productId, params.data.id), eq(reviewsTable.isApproved, true)));

  res.json(reviews.map(r => ({
    id: r.review.id, productId: r.review.productId, userId: r.review.userId,
    userName: r.user?.fullName ?? null, rating: r.review.rating,
    title: r.review.title ?? null, body: r.review.body ?? null,
    isApproved: r.review.isApproved, createdAt: r.review.createdAt.toISOString(),
  })));
});

router.post("/products/:id/reviews", requireAuth, async (req, res): Promise<void> => {
  const params = CreateReviewParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const user = (req as any).user;

  const [review] = await db.insert(reviewsTable).values({
    productId: params.data.id, userId: user.id, rating: parsed.data.rating,
    title: parsed.data.title, body: parsed.data.body,
  }).returning();

  res.status(201).json({
    id: review.id, productId: review.productId, userId: review.userId,
    userName: user.fullName, rating: review.rating, title: review.title ?? null,
    body: review.body ?? null, isApproved: review.isApproved, createdAt: review.createdAt.toISOString(),
  });
});

router.patch("/reviews/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const params = ApproveReviewParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [review] = await db.update(reviewsTable).set({ isApproved: true }).where(eq(reviewsTable.id, params.data.id)).returning();
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json({ id: review.id, productId: review.productId, userId: review.userId, userName: null, rating: review.rating, title: review.title ?? null, body: review.body ?? null, isApproved: review.isApproved, createdAt: review.createdAt.toISOString() });
});

router.delete("/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteReviewParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(reviewsTable).where(eq(reviewsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
