import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, asc, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
  GetCategoryParams,
  GetCategoryBySlugParams,
} from "@workspace/api-zod";

const router: Router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.parentId), asc(categoriesTable.sortOrder));
  res.json(categories.map(formatCategory));
});

router.get("/categories/by-slug/:slug", async (req, res): Promise<void> => {
  const params = GetCategoryBySlugParams.safeParse({ slug: req.params.slug });
  if (!params.success) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, params.data.slug));
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const children =
    cat.parentId == null
      ? await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.parentId, cat.id))
          .orderBy(asc(categoriesTable.sortOrder))
      : [];
  res.json({ category: formatCategory(cat), children: children.map(formatCategory) });
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const params = GetCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(formatCategory(row));
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.parentId != null) {
    const [p] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, parsed.data.parentId));
    if (!p || p.parentId != null) {
      res.status(400).json({ error: "Subcategories must belong to a top-level category" });
      return;
    }
  }
  const [cat] = await db
    .insert(categoriesTable)
    .values({
      ...parsed.data,
      parentId: parsed.data.parentId ?? null,
    } as typeof categoriesTable.$inferInsert)
    .returning();
  res.status(201).json(formatCategory(cat));
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.parentId !== undefined && parsed.data.parentId !== null) {
    if (parsed.data.parentId === params.data.id) {
      res.status(400).json({ error: "Category cannot be its own parent" });
      return;
    }
    const [p] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, parsed.data.parentId));
    if (!p || p.parentId != null) {
      res.status(400).json({ error: "Parent must be a top-level category" });
      return;
    }
    const cycle = await wouldCreateCycle(params.data.id, parsed.data.parentId);
    if (cycle) {
      res.status(400).json({ error: "Invalid parent: would create a cycle" });
      return;
    }
  }
  const [cat] = await db
    .update(categoriesTable)
    .set(parsed.data as typeof categoriesTable.$inferInsert)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(formatCategory(cat));
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [{ childCount }] = await db
    .select({ childCount: count() })
    .from(categoriesTable)
    .where(eq(categoriesTable.parentId, params.data.id));
  if (childCount > 0) {
    res.status(400).json({ error: "Delete or reassign subcategories first" });
    return;
  }
  const [{ productCount }] = await db
    .select({ productCount: count() })
    .from(productsTable)
    .where(eq(productsTable.categoryId, params.data.id));
  if (productCount > 0) {
    res.status(400).json({ error: "Cannot delete category with products" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  res.sendStatus(204);
});

async function wouldCreateCycle(categoryId: number, newParentId: number): Promise<boolean> {
  let cur: number | null = newParentId;
  for (let i = 0; i < 64 && cur != null; i++) {
    if (cur === categoryId) return true;
    const [row] = await db
      .select({ parentId: categoriesTable.parentId })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, cur));
    if (!row) break;
    cur = row.parentId;
  }
  return false;
}

function formatCategory(cat: typeof categoriesTable.$inferSelect) {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
    imageUrl: cat.imageUrl ?? null,
    cloudinaryPublicId: cat.cloudinaryPublicId ?? null,
    parentId: cat.parentId ?? null,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
  };
}

export default router;
