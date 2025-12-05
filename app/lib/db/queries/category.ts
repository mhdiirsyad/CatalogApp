import db from "..";

export async function getAllCategories() {
  return db.query.categories.findMany();
}
