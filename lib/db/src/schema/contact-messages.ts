import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const contactMessagesTable = pgTable("contact_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessagesTable).omit({
  createdAt: true,
});
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessageRow = typeof contactMessagesTable.$inferSelect;
