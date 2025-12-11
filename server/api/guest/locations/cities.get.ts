import { and, eq } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

// GET /api/guest/locations/cities?province=...
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const province = query.province as string | undefined;

  if (!province) {
    throw createError({
      statusCode: 400,
      statusMessage: "Province parameter is required",
    });
  }

  // Get unique cities for the given province from approved sellers
  const cities = await db
    .selectDistinct({ city: sellers.picCity })
    .from(sellers)
    .where(
      and(
        eq(sellers.status, "APPROVED"),
        eq(sellers.picProvince, province),
      ),
    )
    .orderBy(sellers.picCity);

  return cities.map(c => c.city);
});
