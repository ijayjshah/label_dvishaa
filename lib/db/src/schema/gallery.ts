import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const galleryUploadsTable = pgTable("gallery_uploads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGallerySchema = createInsertSchema(galleryUploadsTable).omit({ createdAt: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryUpload = typeof galleryUploadsTable.$inferSelect;
