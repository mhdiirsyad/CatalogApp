import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { categories } from "./category";
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
