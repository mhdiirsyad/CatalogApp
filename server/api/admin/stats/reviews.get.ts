import { and, count, eq, gte, isNotNull } from "drizzle-orm";

import db from "~/lib/db";
import { reviews } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // Get period from query params (default: all)
  const query = getQuery(event);
  const period = query.period as string || "all";

  // Calculate timestamp based on period
  let dateFilter;
  const now = Date.now();
  if (period === "1d") {
    dateFilter = now - (24 * 60 * 60 * 1000); // 1 day
  }
  else if (period === "7d") {
    dateFilter = now - (7 * 24 * 60 * 60 * 1000); // 7 days
  }
  else if (period === "30d") {
    dateFilter = now - (30 * 24 * 60 * 60 * 1000); // 30 days
  }

  // Build where clause
  const whereClause = dateFilter ? gte(reviews.createdAt, dateFilter) : undefined;

  // Get total reviews (all reviews have ratings)
  const totalReviews = await db
    .select({ count: count(reviews.id) })
    .from(reviews)
    .where(whereClause);

  // Get reviews with comments (comment is not null and not empty)
  const reviewsWithComments = await db
    .select({ count: count(reviews.id) })
    .from(reviews)
    .where(whereClause ? and(whereClause, isNotNull(reviews.comment)) : isNotNull(reviews.comment));

  async function getStarRating(rating: number) {
    const star = await db
      .select({ count: count(reviews.id) })
      .from(reviews)
      .where(whereClause ? and(whereClause, eq(reviews.rating, rating)) : eq(reviews.rating, rating));
    return star[0].count;
  }

  return {
    totalReviews: totalReviews[0]?.count || 0,
    reviewsWithComments: reviewsWithComments[0]?.count || 0,
    reviewsWithRatingOnly: (totalReviews[0]?.count || 0) - (reviewsWithComments[0]?.count || 0),
    oneStarRating: await getStarRating(1),
    twoStarRating: await getStarRating(2),
    threeStarRating: await getStarRating(3),
    fourStarRating: await getStarRating(4),
    fiveStarRating: await getStarRating(5),
  };
});
