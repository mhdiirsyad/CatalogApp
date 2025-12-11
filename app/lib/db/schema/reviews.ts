import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import z from "zod";

import { products } from "./products";

export const reviews = sqliteTable("reviews", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  noHp: text().notNull(),
  email: text().notNull(),
  rating: int().notNull(),
  comment: text(),
  province: text(),
  product_id: int().notNull().references(() => products.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const reviewRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
}));

export type SelectReview = typeof reviews.$inferSelect;

// Schema untuk insert review (tanpa slug)
export const InsertReviewSchema = z.object({
  name: z.string().min(1).max(100),
  noHp: z.string().regex(/^08\d{9,11}$/),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  province: z.string().min(1),
});

// Schema untuk validasi request API (dengan slug)
export const InsertReviewWithSlugSchema = InsertReviewSchema.extend({
  slug: z.string().min(1),
});

export type InsertReviewSchema = z.infer<typeof InsertReviewSchema>;
export type InsertReviewWithSlugSchema = z.infer<typeof InsertReviewWithSlugSchema>;
