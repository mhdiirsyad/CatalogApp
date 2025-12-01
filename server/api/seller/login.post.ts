import { and, eq, or } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { identifier, password } = body;
  const user = await db.select().from(sellers).where(and(
    or(
      eq(sellers.picEmail, identifier),
      eq(sellers.picHp, identifier),
    ),
  )).then(r => r[0]);

  if (!user)
    sendError(event, createError({ statusCode: 401, statusMessage: "Invalid credentials" }));

  const ok = await verifyPassword(user.password, password);
  if (!ok)
    sendError(event, createError({ statusCode: 401, statusMessage: "Invalid password" }));

  if (user.status !== "APPROVED") {
    sendError(event, createError({ statusCode: 403, statusMessage: "Account not approved" }));
  }
  await setUserSession(event, { user: { id: user.id, role: "seller", email: user.picEmail } });
  try {
    const sc = (event as any).node?.res?.getHeader?.("set-cookie") || (event as any).node?.res?.getHeader?.("Set-Cookie");
    if (sc)
      console.error("[login] setUserSession called, response set-cookie:", sc);
  }
  catch {
  }

  const { password: _p, ...safe } = user;
  return { user: safe };
});
