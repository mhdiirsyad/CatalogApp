import { eq } from "drizzle-orm";

import db from "..";
import { productImages } from "../schema";

export async function deleteImagesByProduct(productId: number) {
  const deleted = await db.delete(productImages).where(
    eq(productImages.product_id, productId),
  ).returning();

  return deleted;
}
