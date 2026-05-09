import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sizesTable = pgTable("sizes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: text("label").notNull().unique(),
  bustRange: text("bust_range"),
  waistRange: text("waist_range"),
  hipRange: text("hip_range"),
  heightRange: text("height_range"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSizeSchema = createInsertSchema(sizesTable);
export type InsertSize = z.infer<typeof insertSizeSchema>;
export type Size = typeof sizesTable.$inferSelect;
