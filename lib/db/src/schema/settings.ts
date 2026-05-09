import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  group: text("group").notNull().default("general"),
});

export const insertSettingSchema = createInsertSchema(siteSettingsTable);
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
