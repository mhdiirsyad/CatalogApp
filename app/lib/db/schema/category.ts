import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import { products } from "./products";

export const categories = sqliteTable("categories", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  slug: text().notNull().unique(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const InsertCategory = createInsertSchema(categories, {
  name: field => field.min(1, "Category name is required").max(100, "Category name is too long"),
  description: field => field.max(255, "Description is too long").optional(),
  slug: field => field.min(1, "Slug is required").max(100, "Slug is too long").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCategory = InsertCategory.partial();

export type SelectCategory = typeof categories.$inferSelect;
export type InputCategory = ReturnType<typeof InsertCategory.parse>;
export type UpdateCategoryInput = ReturnType<typeof UpdateCategory.parse>;
