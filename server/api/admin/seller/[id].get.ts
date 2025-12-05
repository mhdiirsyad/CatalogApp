import { findSellerById } from "~/lib/db/queries/seller";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  const result = await findSellerById(Number(id));

  return result;
});
