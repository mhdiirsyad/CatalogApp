import { findProductBySlug } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);
  return findProductBySlug(slug);
});
