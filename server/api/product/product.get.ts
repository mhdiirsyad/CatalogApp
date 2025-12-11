import { findProducts } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  // const session = await getUserSession(event);
  const query = getQuery(event);

  const searchQuery = query.search as string | undefined;
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
  const province = query.province as string | undefined;
  const city = query.city as string | undefined;

  // if (session.user) {
  //   const sellerId = Number((session.user as any).id);
  //   return findProducts({
  //     sellerId,
  //     searchQuery,
  //     categoryId,
  //     province,
  //     city,
  //   });
  // }

  return findProducts({
    searchQuery,
    categoryId,
    province,
    city,
  });
});
