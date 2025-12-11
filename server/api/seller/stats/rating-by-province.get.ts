import { desc, eq, sql } from "drizzle-orm";

import db from "~/lib/db";
import { products, reviews } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  const seller = await sellerAuth.seller(event);
  if (!seller) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Get reviews distribution by province
  const provinceDistribution = await db
    .select({
      province: reviews.province,
      count: sql<number>`count(*)`.as("count"),
      avgRating: sql<number>`avg(${reviews.rating})`.as("avgRating"),
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.product_id, products.id))
    .where(eq(products.seller_id, seller.id))
    .groupBy(reviews.province)
    .orderBy(desc(sql`count(*)`))
    .all();

  return provinceDistribution.map(item => ({
    province: item.province || "Tidak diketahui",
    count: item.count,
    avgRating: Number(item.avgRating.toFixed(1)),
  }));
});
