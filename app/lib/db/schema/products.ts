import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import type { SelectCategory } from "./category";
import type { SelectProductImage } from "./product-images";
import type { SelectReview } from "./reviews";
import type { SelectSeller } from "./seller";

import { categories } from "./category";
import { productImages } from "./product-images";
import { reviews } from "./reviews";
import { sellers } from "./seller";

export const products = sqliteTable("products", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  slug: text().notNull().unique(),
  stock: int().notNull(),
  price: int().notNull(),
  rating: real().notNull().$default(() => 0),
  seller_id: int().notNull().references(() => sellers.id, { onDelete: "cascade" }),
  category_id: int().notNull().references(() => categories.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),

  seller: one(sellers, {
    fields: [products.seller_id],
    references: [sellers.id],
  }),

  reviews: many(reviews),
  productImages: many(productImages),
}));

export const InsertProduct = createInsertSchema(products, {
  name: field => field.min(1).max(100),
  description: field => field.max(100).optional(),
  stock: field => field.min(1),
  price: field => field.min(1),
}).omit({
  id: true,
  rating: true,
  seller_id: true,
  createdAt: true,
  updatedAt: true,
});

export type SelectProduct = typeof products.$inferSelect;
export type SelectProductFull = SelectProduct & {
  category: SelectCategory;
  reviews: SelectReview[];
  productImages: SelectProductImage[];
  seller: SelectSeller;
};
