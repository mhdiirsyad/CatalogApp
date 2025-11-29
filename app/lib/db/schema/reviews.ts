import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "./products";

export const reviews = sqliteTable("reviews", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  noHp: text().notNull(),
  email: text().notNull(),
  rating: int().notNull(),
  comment: text(),
  product_id: int().notNull().references(() => products.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
