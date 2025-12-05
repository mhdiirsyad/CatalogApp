import { and, avg, eq, inArray, like } from "drizzle-orm";

import db from "..";
import { productImages, products, reviews } from "../schema";
import { deleteImagesByProduct } from "./product-image";

export async function findProductsByName(name: string) {
  return db.query.products.findMany({
    where: like(products.name, `%${name}%`),
    with: {
      category: true,
      productImages: { orderBy(field, operators) {
        return operators.asc(field.createdAt);
      } },
      reviews: true,
    },
  });
}

export async function findProductsByNameAndSeller(name: string, sellerId: number) {
  return db.query.products.findMany({
    where: and(
      eq(products.name, name),
      eq(products.seller_id, sellerId),
    ),
    with: {
      productImages: {
        orderBy(field, operators) {
          return operators.asc(field.createdAt);
        },
      },
    },
  });
}

export async function getAllProducts() {
  return db.query.products.findMany({
    with: {
      reviews: true,
      productImages: { orderBy(field, operators) {
        return operators.asc(field.createdAt);
      } },
      category: true,
    },
  });
}

export async function findProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      reviews: { orderBy(field, operators) {
        return operators.desc(field.createdAt);
      } },
      productImages: { orderBy(field, operators) {
        return operators.asc(field.createdAt);
      } },
    },
  });
}

export async function findProducts(sellerId: number) {
  return db.query.products.findMany({
    where: eq(products.seller_id, sellerId),
    with: { category: true, reviews: true, productImages: { orderBy(field, operators) {
      return operators.asc(field.createdAt);
    } } },
  });
}

export async function searchProducts(
  sellerId: number,
  searchQuery?: string,
  categoryId?: number,
) {
  const conditions = [eq(products.seller_id, sellerId)];

  if (searchQuery) {
    conditions.push(like(products.name, `%${searchQuery}%`));
  }

  if (categoryId) {
    conditions.push(eq(products.category_id, categoryId));
  }

  return db.query.products.findMany({
    where: and(...conditions),
    with: {
      category: true,
      reviews: true,
      productImages: {
        orderBy(field, operators) {
          return operators.asc(field.createdAt);
        },
      },
    },
  });
}

export async function updateProduct(input: typeof insertSchema, sellerId: number, slug: string) {
  const [updated] = await db.update(products).set(input).where(and(
    eq(products.seller_id, sellerId),
    eq(products.slug, slug),
  )).returning();
  return updated;
}

export async function updateProductRating(slug: string) {
  const product = await findProductBySlug(slug);
  if (product) {
    const [result] = await db.select({
      avgRating: avg(reviews.rating),
    }).from(reviews).where(eq(reviews.product_id, product.id));

    const avgRating = result?.avgRating ? Number(result.avgRating) : 0;

    return await db.update(products)
      .set({ rating: avgRating })
      .where(eq(products.id, product.id))
      .returning();
  }
}

export async function deleteProduct(sellerId: number, slug: string) {
  const product = await findProductBySlug(slug);
  const [removed] = await db.delete(products).where(and(
    eq(products.seller_id, sellerId),
    eq(products.slug, slug),
  )).returning();
  if (product) {
    await deleteImagesByProduct(product.id);
  }

  return removed;
}

export async function insertProductImages(productId: number, imageKeys: string[]) {
  if (imageKeys.length === 0)
    return [];

  const values = imageKeys.map(key => ({
    product_id: productId,
    imageUrl: key,
  }));

  return db.insert(productImages).values(values).returning();
}

export async function deleteProductImages(productId: number) {
  return db.delete(productImages).where(eq(productImages.product_id, productId));
}

export async function deleteProductImagesByKeys(keys: string[]) {
  return db.delete(productImages).where(inArray(productImages.imageUrl, keys));
}
