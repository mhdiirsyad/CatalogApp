import { deleteProduct } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { slug } = getRouterParams(event);

  return deleteProduct((user as any).id, slug);
});
