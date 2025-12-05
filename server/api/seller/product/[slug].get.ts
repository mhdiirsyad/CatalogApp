import { findProductBySlug } from "~/lib/db/queries/products";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (!user) {
    sendError(event, createError({
      statusCode: 401,
      statusMessage: "Not Authenticated",
    }));
  }
  const { slug } = getRouterParams(event);
  return await findProductBySlug(slug);
});
