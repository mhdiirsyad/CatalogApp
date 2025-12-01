import { jwtVerify, SignJWT } from "jose";

import env from "~/lib/env";

const alg = "HS256";

export async function createJWT(payload: Record<string, any>, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = new TextEncoder().encode(env.NUXT_JWT_SECRET);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
}

export async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(env.NUXT_JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
