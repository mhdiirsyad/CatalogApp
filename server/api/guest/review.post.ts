import { updateProductRating } from "~/lib/db/queries/products";
import { addReview } from "~/lib/db/queries/review";
import { InsertReviewWithSlugSchema } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, InsertReviewWithSlugSchema.safeParse);

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid Body",
      data: body.error.errors,
    });
  }

  const { slug, ...reviewData } = body.data;
  const result = await addReview(reviewData, slug);
  await updateProductRating(slug);

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product not found",
    });
  }

  return {
    name: result.name,
    rating: result.rating,
  };
});
