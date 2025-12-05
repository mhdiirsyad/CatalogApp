import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "./products";

export const productImages = sqliteTable("productImages", {
  id: int().primaryKey({ autoIncrement: true }),
  imageUrl: text().notNull(),
  product_id: int().notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.product_id],
    references: [products.id],
  }),
}));

export type SelectProductImage = typeof productImages.$inferSelect;
