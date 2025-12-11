import { findProducts } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const query = getQuery(event);

  const searchQuery = query.search as string | undefined;
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
  const province = query.province as string | undefined;
  const city = query.city as string | undefined;

  if (searchQuery || categoryId || province || city) {
    if (session.user) {
      return findProducts({
        sellerId: (session.user as any).id,
        searchQuery,
        categoryId,
        province,
        city,
      });
    }
    return findProducts({
      searchQuery,
      categoryId,
      province,
      city,
    });
  }

  return findProducts();
});
