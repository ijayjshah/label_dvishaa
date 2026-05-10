import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const customOrderStatusEnum = pgEnum("custom_order_status", [
  "pending",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
]);

export const customOrderRequestsTable = pgTable("custom_order_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  inspirationImageUrl: text("inspiration_image_url"),
  inspirationCloudinaryPublicId: text("inspiration_cloudinary_public_id"),
  description: text("description"),
  bust: text("bust"),
  waist: text("waist"),
  hip: text("hip"),
  height: text("height"),
  colors: text("colors"),
  status: customOrderStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCustomOrderRequestSchema = createInsertSchema(customOrderRequestsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertCustomOrderRequest = z.infer<typeof insertCustomOrderRequestSchema>;
export type CustomOrderRequestRow = typeof customOrderRequestsTable.$inferSelect;
