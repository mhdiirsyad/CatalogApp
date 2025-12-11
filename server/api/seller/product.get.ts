import { findProducts } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const query = getQuery(event);

  const searchQuery = query.searchQuery as string | undefined;
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined;

  if (searchQuery || categoryId) {
    return findProducts({
      sellerId: (user as any).id,
      searchQuery,
      categoryId,
    });
  }

  return findProducts({
    sellerId: (user as any).id,
  });
});
