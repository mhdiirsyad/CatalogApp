import { eq, sql } from "drizzle-orm";

import db from "~/lib/db";
import { products, reviews } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  const seller = await sellerAuth.seller(event);
  if (!seller) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Get all reviews for seller's products grouped by rating
  const ratingDistribution = await db
    .select({
      rating: reviews.rating,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.product_id, products.id))
    .where(eq(products.seller_id, seller.id))
    .groupBy(reviews.rating)
    .all();

  // Get total reviews count
  const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);

  // Create distribution map for all ratings (1-5)
  const distribution = [1, 2, 3, 4, 5].map((rating) => {
    const found = ratingDistribution.find(r => r.rating === rating);
    const count = found ? found.count : 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    return {
      rating,
      count,
      percentage: Number(percentage.toFixed(1)),
    };
  });

  // Calculate average rating
  const totalRatingPoints = ratingDistribution.reduce((sum, item) => sum + (item.rating * item.count), 0);
  const averageRating = totalReviews > 0 ? totalRatingPoints / totalReviews : 0;

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
    distribution,
  };
});
