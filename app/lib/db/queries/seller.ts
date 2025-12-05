import { eq } from "drizzle-orm";

import db from "..";
import { sellers } from "../schema";

export async function getAllSellers() {
  const result = await db.query.sellers.findMany();
  return result;
}

export async function findSellerById(id: number) {
  const result = await db.query.sellers.findFirst({
    where: eq(sellers.id, id),
  });

  return result;
}

export async function updateSellerStatus(sellerId: number, status: "PENDING" | "APPROVED" | "CANCELLED") {
  const [result] = await db.update(sellers).set({
    status,
    verifiedAt: Number(new Date()),
  }).where(eq(sellers.id, sellerId)).returning({
    id: sellers.id,
    status: sellers.status,
  });

  return result;
}
