import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";
import { productColorsTable, productSizesTable } from "./products";

export const cartsTable = pgTable("carts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const cartItemsTable = pgTable("cart_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cartId: integer("cart_id").notNull().references(() => cartsTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  colorId: integer("color_id").references(() => productColorsTable.id, { onDelete: "set null" }),
  productSizeId: integer("product_size_id").references(() => productSizesTable.id, { onDelete: "set null" }),
  customMeasurements: jsonb("custom_measurements"),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartSchema = createInsertSchema(cartsTable).omit({ createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItemsTable);
export type Cart = typeof cartsTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
