import adminAuth from "~~/server/utils/admin-auth";

import { AdminLoginSchema } from "~/utils/admin";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, AdminLoginSchema.safeParse);

  if (!body.success) {
    sendError(event, createError({
      statusCode: 422,
      statusMessage: "Invalid Input",
    }));
  }
  else {
    const { username, password } = body.data;
    await adminAuth.attempt(event, username, password);
  }
});
