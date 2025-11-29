import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "./products";

export const productImages = sqliteTable("productImages", {
  id: int().primaryKey({ autoIncrement: true }),
  imageUrl: text().notNull(),
  product_id: int().notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
