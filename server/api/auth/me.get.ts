import sellerAuth from "~~/server/utils/seller-auth";

// GET /api/auth/me
export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const seller = await sellerAuth.seller(event);

  if (!seller) {
    sendError(event, createError({ statusCode: 404, statusMessage: "User not found" }));
  }

  return { user: seller };
});
