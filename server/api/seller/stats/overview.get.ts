import { count, eq, inArray, sum } from "drizzle-orm";

import db from "~/lib/db";
import { products, reviews } from "~/lib/db/schema";

// GET /api/seller/stats/overview
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const sellerId = (session.user as any)?.id;
  if (!sellerId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Get total products
  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)));

  // Get total stock
  const [stockSum] = await db
    .select({ total: sum(products.stock) })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)));

  // Get all products to calculate low stock
  const allProducts = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)));

  const lowStockCount = allProducts.filter(p => p.stock < 10).length;

  // Get total reviews for seller's products
  const sellerProductIds = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.seller_id, Number(sellerId)));

  const productIds = sellerProductIds.map(p => p.id);

  let reviewCount = 0;
  if (productIds.length > 0) {
    const [reviewResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(inArray(reviews.product_id, productIds));
    reviewCount = reviewResult?.count || 0;
  }

  return {
    totalProducts: productCount?.count || 0,
    totalStock: Number(stockSum?.total) || 0,
    lowStockProducts: lowStockCount,
    totalReviews: reviewCount,
  };
});
