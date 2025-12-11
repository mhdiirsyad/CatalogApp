import { eq } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

// GET /api/guest/locations/provinces
export default defineEventHandler(async () => {
  // Get unique provinces from approved sellers
  const provinces = await db
    .selectDistinct({ province: sellers.picProvince })
    .from(sellers)
    .where(eq(sellers.status, "APPROVED"))
    .orderBy(sellers.picProvince);

  return provinces.map(p => p.province);
});
