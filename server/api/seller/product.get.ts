import { findProducts, searchProducts } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const query = getQuery(event);

  const search = query.search as string | undefined;
  const categoryId = query.category ? Number(query.category) : undefined;

  if (search || categoryId) {
    return searchProducts((user as any).id, search, categoryId);
  }

  return findProducts((user as any).id);
});
