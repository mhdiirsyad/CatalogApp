import { eq } from "drizzle-orm";
import { z } from "zod";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

const updateProfileSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(100),
  description: z.string().min(1, "Description is required").max(255),
  picName: z.string().min(1, "PIC name is required").max(100),
  picHp: z
    .string()
    .min(11, "Phone number must be at least 11 characters")
    .max(15, "Phone number must be at most 15 characters")
    .regex(/^\+?\d+$/, "Phone number must contain only digits and optional leading +"),
  address: z.string().min(5, "Address is too short").max(255),
  picRT: z.number().int().min(1, "RT is required").max(999),
  picRW: z.number().int().min(1, "RW is required").max(999),
  picProvince: z.string().min(1, "Province is required").max(100),
  picCity: z.string().min(1, "City is required").max(100),
  picDistrict: z.string().min(1, "District is required").max(100),
  picVillage: z.string().min(1, "Village is required").max(100),
});

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const session = await getUserSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const rawUserId = (session as any).user?.id ?? session.id;
  if (!rawUserId) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const userId = Number(rawUserId);
  if (Number.isNaN(userId)) {
    throw createError({
      statusCode: 500,
      message: "Invalid session user id",
    });
  }

  const body = await readBody(event);
  const validatedData = updateProfileSchema.safeParse(body);

  if (!validatedData.success) {
    throw createError({
      statusCode: 400,
      message: "Validation error",
      data: validatedData.error.errors,
    });
  }

  try {
    // Get current seller data
    const currentSeller = await db.query.sellers.findFirst({
      where: eq(sellers.id, userId),
    });

    if (!currentSeller) {
      throw createError({
        statusCode: 404,
        message: "Seller not found",
      });
    }

    // Check if phone number is already used by another seller
    if (validatedData.data.picHp !== currentSeller.picHp) {
      const existingSeller = await db.query.sellers.findFirst({
        where: eq(sellers.picHp, validatedData.data.picHp),
      });

      if (existingSeller && existingSeller.id !== userId) {
        throw createError({
          statusCode: 400,
          message: "Phone number already registered",
        });
      }
    }

    const [updatedSeller] = await db
      .update(sellers)
      .set({
        ...validatedData.data,
        updatedAt: Date.now(),
      })
      .where(eq(sellers.id, userId))
      .returning();

    return {
      success: true,
      data: updatedSeller,
    };
  }
  catch (error) {
    console.error("Error updating seller profile:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to update profile",
    });
  }
});
