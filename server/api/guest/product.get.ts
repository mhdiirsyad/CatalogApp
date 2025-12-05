import { getAllProducts } from "~/lib/db/queries/products";

export default defineEventHandler(async () => {
  const result = await getAllProducts();

  return result;
});
