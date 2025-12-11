import type { H3Event } from "h3";

import { eq, or } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

async function login(event: H3Event<Request>, seller: any) {
  await replaceUserSession(event, {
    user: {
      id: seller.id,
      role: "seller",
      email: seller.picEmail,
      storeName: seller.storeName,
    },
    loggedInAt: new Date(),
  });
}

async function getCurrentSeller(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const result = await db.query.sellers.findFirst({
    where: eq(sellers.id, (session.user as any).id),
    columns: {
      password: false,
    },
  });
  return result;
}

async function attempt(event: H3Event<Request>, identifier: string, password: string) {
  // Support login with email or phone
  const foundUser = await db.select().from(sellers).where(
    or(
      eq(sellers.picEmail, identifier),
      eq(sellers.picHp, identifier),
    ),
  ).then(r => r[0]);

  const verified = await verifyPassword(foundUser?.password || "", password);

  if (!foundUser || !verified) {
    sendError(event, createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    }));
  }

  // Check if seller is approved
  if (foundUser?.status !== "APPROVED") {
    sendError(event, createError({
      statusCode: 403,
      statusMessage: "Your account is not yet approved",
    }));
  }

  await login(event, foundUser);
  return true;
}

export default {
  login,
  seller: getCurrentSeller,
  attempt,
};
