import { count } from "drizzle-orm";

import db from "~/lib/db";
import { reviews } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // Get review count by rating (1-5 stars)
  const result = await db
    .select({
      rating: reviews.rating,
      count: count(reviews.id),
    })
    .from(reviews)
    .groupBy(reviews.rating)
    .orderBy(reviews.rating);

  // Transform to object with all ratings (1-5)
  const ratingStats = {
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };

  result.forEach((row) => {
    if (row.rating === 1)
      ratingStats.rating1 = row.count;
    else if (row.rating === 2)
      ratingStats.rating2 = row.count;
    else if (row.rating === 3)
      ratingStats.rating3 = row.count;
    else if (row.rating === 4)
      ratingStats.rating4 = row.count;
    else if (row.rating === 5)
      ratingStats.rating5 = row.count;
  });

  return ratingStats;
});
