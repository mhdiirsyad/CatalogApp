import { getAllCategories } from "~/lib/db/queries/category";

export default defineEventHandler(async () => {
  const result = await getAllCategories();
  return result;
});
