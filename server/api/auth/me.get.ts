import { eq } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

// GET /api/auth/me
export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const session = await getUserSession(event);
  if (!session) {
    return null;
  }

  // prefer session.user.id (set by login), fall back to session.id
  const rawUserId = (session as any).user?.id ?? session.id;
  if (!rawUserId) {
    return null;
  }

  const userId = Number(rawUserId);
  if (Number.isNaN(userId)) {
    console.error("[auth/me] invalid user id in session:", rawUserId);
    return sendError(event, createError({ statusCode: 500, statusMessage: "Invalid session user id" }));
  }

  const user = await db.select().from(sellers).where(eq(sellers.id, userId)).then(r => r[0]);
  if (!user) {
    sendError(event, createError({ statusCode: 404, statusMessage: "User not found" }));
  }

  const { password: _p, ...safe } = user as any;
  return { user: safe };
});
