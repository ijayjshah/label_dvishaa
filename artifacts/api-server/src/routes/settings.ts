import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { UpsertSettingBody, UpsertSettingParams } from "@workspace/api-zod";

const router: Router = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  res.json(settings);
});

router.put("/settings/:key", requireAdmin, async (req, res): Promise<void> => {
  const params = UpsertSettingParams.safeParse({ key: req.params.key });
  if (!params.success) { res.status(400).json({ error: "Invalid key" }); return; }
  const parsed = UpsertSettingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, params.data.key));
  let setting;
  if (existing) {
    const [updated] = await db.update(siteSettingsTable)
      .set({ value: parsed.data.value, group: parsed.data.group ?? existing.group })
      .where(eq(siteSettingsTable.key, params.data.key))
      .returning();
    setting = updated;
  } else {
    const [created] = await db.insert(siteSettingsTable)
      .values({ key: params.data.key, value: parsed.data.value, group: parsed.data.group ?? "general" })
      .returning();
    setting = created;
  }
  res.json(setting);
});

export default router;
