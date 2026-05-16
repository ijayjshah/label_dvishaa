import { Router } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin, optionalAuth } from "../lib/auth";
import {
  ListBlogPostsQueryParams,
  CreateBlogPostBody,
  UpdateBlogPostBody,
  UpdateBlogPostParams,
  GetBlogPostParams,
  GetBlogPostBySlugParams,
  DeleteBlogPostParams,
} from "@workspace/api-zod";

const router: Router = Router();

function formatBlog(row: typeof blogPostsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? null,
    body: row.body,
    featuredImageUrl: row.featuredImageUrl ?? null,
    featuredImageCloudinaryPublicId: row.featuredImageCloudinaryPublicId ?? null,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/blog-posts", optionalAuth, async (req, res): Promise<void> => {
  const qp = ListBlogPostsQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 12) : 12;
  const user = (req as any).user;
  const isAdmin = user?.role === "admin";
  const visibility = isAdmin ? undefined : eq(blogPostsTable.isPublished, true);

  const whereClause = visibility;
  const [{ total }] = await db.select({ total: count() }).from(blogPostsTable).where(whereClause);
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(whereClause)
    .orderBy(desc(blogPostsTable.sortOrder), desc(blogPostsTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    data: rows.map(formatBlog),
    total,
    page,
    limit,
  });
});

router.get("/blog-posts/slug/:slug", optionalAuth, async (req, res): Promise<void> => {
  const params = GetBlogPostBySlugParams.safeParse({ slug: req.params.slug });
  if (!params.success) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }
  const user = (req as any).user;
  const isAdmin = user?.role === "admin";
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, params.data.slug));
  if (!row || (!row.isPublished && !isAdmin)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatBlog(row));
});

router.get("/blog-posts/:id", optionalAuth, async (req, res): Promise<void> => {
  const params = GetBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const user = (req as any).user;
  const isAdmin = user?.role === "admin";
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, params.data.id));
  if (!row || (!row.isPublished && !isAdmin)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatBlog(row));
});

router.post("/blog-posts", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(blogPostsTable)
    .values({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      featuredImageUrl: parsed.data.featuredImageUrl,
      featuredImageCloudinaryPublicId: parsed.data.featuredImageCloudinaryPublicId,
      isPublished: parsed.data.isPublished ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(formatBlog(row));
});

router.patch("/blog-posts/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(blogPostsTable)
    .set(
      Object.fromEntries(
        Object.entries(parsed.data).filter(([, v]) => v !== undefined),
      ) as Partial<typeof blogPostsTable.$inferInsert>,
    )
    .where(eq(blogPostsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatBlog(row));
});

router.delete("/blog-posts/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
