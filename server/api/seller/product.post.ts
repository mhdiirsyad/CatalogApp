import db from "~/lib/db";
import { findProductsByNameAndSeller, insertProductImages } from "~/lib/db/queries/products";
import { products } from "~/lib/db/schema";

import { insertSchema } from "../../../app/utils/product-schema";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const result = await readValidatedBody(event, insertSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please fill form correctly",
      data: result.error.errors,
    });
  }

  const exist = await findProductsByNameAndSeller(result.data.name, (session.user as any).id);

  console.error("Checking product name:", result.data.name);
  console.error("Seller ID:", (session.user as any).id);
  console.error("Existing products found:", exist.length);
  console.error("Existing products:", exist);

  if (exist.length > 0) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: "Nama Product telah digunakan",
    }));
  }

  const { imageKeys, ...productData } = result.data;

  const [inserted] = await db.insert(products).values({
    ...productData,
    description: productData.description || "",
    slug: result.data.name.replaceAll(" ", "-").toLowerCase() + Math.ceil(Math.random() * 100000) || "",
    seller_id: (session.user as any).id,
  }).returning();

  // Insert product images if provided
  if (imageKeys && imageKeys.length > 0) {
    await insertProductImages(inserted.id, imageKeys);
  }

  return inserted;
});
