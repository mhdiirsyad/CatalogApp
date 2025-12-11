import { eq } from "drizzle-orm";

import db from "~/lib/db";
import { products } from "~/lib/db/schema";

// GET /api/seller/stats/products-stock
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const sellerId = (session.user as any)?.id;
  if (!sellerId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Get all products with stock for this seller
  const sellerProducts = await db
    .select({
      name: products.name,
      stock: products.stock,
    })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)))
    .orderBy(products.stock);

  return sellerProducts;
});
