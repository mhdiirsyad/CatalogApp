import { eq } from "drizzle-orm";
import { z } from "zod";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
      "Password must include uppercase, lowercase, number and special character",
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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
  const validatedData = updatePasswordSchema.safeParse(body);

  if (!validatedData.success) {
    throw createError({
      statusCode: 400,
      message: "Validation error",
      data: validatedData.error.errors,
    });
  }

  try {
    // Get current seller data
    const seller = await db.query.sellers.findFirst({
      where: eq(sellers.id, userId),
    });

    if (!seller) {
      throw createError({
        statusCode: 404,
        message: "Seller not found",
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(seller.password, validatedData.data.currentPassword);

    if (!isPasswordValid) {
      throw createError({
        statusCode: 400,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.data.newPassword);

    // Update password
    await db
      .update(sellers)
      .set({
        password: hashedPassword,
        updatedAt: Date.now(),
      })
      .where(eq(sellers.id, userId));

    return {
      success: true,
      message: "Password updated successfully",
    };
  }
  catch (error: any) {
    console.error("Error updating password:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to update password",
    });
  }
});
