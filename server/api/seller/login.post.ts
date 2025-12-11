import sellerAuth from "~~/server/utils/seller-auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { identifier, password } = body;

  // Support login with email or phone
  await sellerAuth.attempt(event, identifier, password);

  // Get current seller data after login
  const seller = await sellerAuth.seller(event);

  return { user: seller };
});
