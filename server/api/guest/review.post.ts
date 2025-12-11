import { updateProductRating } from "~/lib/db/queries/products";
import { addReview } from "~/lib/db/queries/review";
import { InsertReviewWithSlugSchema } from "~/lib/db/schema";

import { sendReviewEmailTemplate } from "../../utils/email-templates";

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

  try {
    const emailTemplate = sendReviewEmailTemplate(result.email, result.name);

    await sendEmail(emailTemplate);
  }
  catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't throw error - email failure shouldn't block the status update
  }

  return {
    name: result.name,
    rating: result.rating,
  };
});
