import type { InsertReviewSchema } from "../schema";

import db from "..";
import { reviews } from "../schema";
import { findProductBySlug } from "./products";

export async function addReview(review: InsertReviewSchema, slug: string) {
  const product = await findProductBySlug(slug);

  if (product) {
    const [result] = await db.insert(reviews).values({
      name: review.name,
      rating: review.rating,
      email: review.email,
      noHp: review.noHp,
      comment: review.comment,
      product_id: product?.id,
    }).returning();
    return result;
  }
}
