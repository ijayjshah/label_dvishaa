import { Router } from "express";
import { db, sizesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { CreateSizeBody, UpdateSizeBody, UpdateSizeParams, DeleteSizeParams } from "@workspace/api-zod";

const router: Router = Router();

router.get("/sizes", async (_req, res): Promise<void> => {
  const sizes = await db.select().from(sizesTable).where(eq(sizesTable.isActive, true)).orderBy(asc(sizesTable.sortOrder));
  res.json(sizes);
});

router.post("/sizes", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateSizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [size] = await db.insert(sizesTable).values(parsed.data).returning();
  res.status(201).json(size);
});

router.patch("/sizes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateSizeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateSizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [size] = await db.update(sizesTable).set(parsed.data).where(eq(sizesTable.id, params.data.id)).returning();
  if (!size) { res.status(404).json({ error: "Size not found" }); return; }
  res.json(size);
});

router.delete("/sizes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteSizeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(sizesTable).where(eq(sizesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
