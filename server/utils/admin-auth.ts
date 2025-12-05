import type { H3Event } from "h3";

import { eq } from "drizzle-orm";

import db from "~/lib/db";
import { admin } from "~/lib/db/schema";

async function login(event: H3Event<Request>, admin: any) {
  await replaceUserSession(event, {
    user: {
      id: admin.id,
      role: "admin",
      username: admin.username,
    },
    loggedInAt: new Date(),
  });
}

async function getCurrentAdmin(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const result = await db.query.admin.findFirst({
    where: eq(admin.id, (session.user as any).id),
    columns: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });
  return result;
}

async function attempt(event: H3Event<Request>, username: string, password: string) {
  const foundUser = await db.query.admin.findFirst({
    where: eq(admin.username, username),
  });

  const verified = await verifyPassword(foundUser?.password || "", password);
  //   console.log(await hashPassword(password));
  if (!foundUser || !verified) {
    sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    }));
  }

  await login(event, foundUser);
  return true;
}

export default {
  login,
  admin: getCurrentAdmin,
  attempt,
};
