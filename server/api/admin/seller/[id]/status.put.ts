import { z } from "zod";

import { findSellerById, updateSellerStatus } from "~/lib/db/queries/seller";

import { getSellerApprovedEmailTemplate, getSellerRejectedEmailTemplate } from "../../../../utils/email-templates";
import { sendEmail } from "../../../../utils/send-email";

const UpdateStatusSchema = z.object({
  status: z.enum(["APPROVED", "CANCELLED"]),
});

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Seller ID is required",
    });
  }

  const seller = await findSellerById(Number(id));
  if (!seller) {
    throw createError({
      statusCode: 404,
      statusMessage: "Seller not found",
    });
  }

  const body = await readBody(event);
  const { status } = UpdateStatusSchema.parse(body);

  const result = await updateSellerStatus(Number(id), status);

  try {
    const emailTemplate = status === "APPROVED"
      ? getSellerApprovedEmailTemplate(seller.picName, seller.storeName, seller.picEmail)
      : getSellerRejectedEmailTemplate(seller.picName, seller.storeName, seller.picEmail);

    await sendEmail(emailTemplate);
  }
  catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't throw error - email failure shouldn't block the status update
  }

  return result;
});
