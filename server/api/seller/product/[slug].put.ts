import { deleteImagesFromS3 } from "~~/server/utils/s3";

import { deleteProductImagesByKeys, findProductBySlug, insertProductImages, updateProduct } from "~/lib/db/queries/products";
import { insertSchema } from "~/utils/product-schema";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { slug } = getRouterParams(event);
  const body = await readValidatedBody(event, insertSchema.safeParse);

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid Body",
      data: body.error.errors,
    });
  }

  const { imageKeys, deleteImageKeys, ...productData } = body.data;

  // Update product
  const updated = await updateProduct(
    { ...productData, description: productData.description || "" },
    (user as any).id,
    slug,
  );

  // Get product to find its ID
  const product = await findProductBySlug(slug);
  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product not found",
    });
  }

  // Delete images that were marked for deletion
  if (deleteImageKeys && deleteImageKeys.length > 0) {
    // Delete from R2
    await deleteImagesFromS3(deleteImageKeys);
    // Delete from database
    await deleteProductImagesByKeys(deleteImageKeys);
  }

  // If new images provided, add them to existing images
  if (imageKeys && imageKeys.length > 0) {
    // Insert new images (keep existing ones)
    await insertProductImages(product.id, imageKeys);
  }

  return updated;
});
