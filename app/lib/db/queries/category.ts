import { eq } from "drizzle-orm";

import type { InputCategory, UpdateCategoryInput } from "../schema/category";

import db from "..";
import { categories } from "../schema";

export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
  });
}

export async function getCategoryById(id: number) {
  return db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.id, id),
  });
}

export async function createCategory(data: InputCategory) {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  const result = await db.update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return result[0];
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}
