import { eq } from "drizzle-orm";

import db from "~/lib/db";
import { products } from "~/lib/db/schema";

// GET /api/seller/stats/products-rating
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const sellerId = (session.user as any)?.id;
  if (!sellerId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Get all products with rating for this seller
  const sellerProducts = await db
    .select({
      name: products.name,
      rating: products.rating,
    })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)))
    .orderBy(products.rating);

  return sellerProducts;
});
