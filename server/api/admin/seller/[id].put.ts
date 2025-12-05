import { updateSellerStatus } from "~/lib/db/queries/seller";
import { InsertSeller } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  const body = await readValidatedBody(event, InsertSeller.safeParse);

  if (body.success && body.data.status) {
    return updateSellerStatus(Number(id), body.data.status);
  }

  sendError(event, createError({
    statusCode: 422,
    statusMessage: "Invalid body",
  }));
});
