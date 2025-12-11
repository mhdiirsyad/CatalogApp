import { count, gte, sql } from "drizzle-orm";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // Get period from query params (default: all)
  const query = getQuery(event);
  const period = query.period as string || "all";

  // Calculate timestamp based on period
  let dateFilter;
  const now = Date.now();
  if (period === "1d") {
    dateFilter = now - (24 * 60 * 60 * 1000); // 1 day
  }
  else if (period === "7d") {
    dateFilter = now - (7 * 24 * 60 * 60 * 1000); // 7 days
  }
  else if (period === "30d") {
    dateFilter = now - (30 * 24 * 60 * 60 * 1000); // 30 days
  }

  // Build where clause
  const whereClause = dateFilter ? gte(sellers.createdAt, dateFilter) : undefined;

  // Get seller count by province
  const result = await db
    .select({
      province: sellers.picProvince,
      sellerCount: count(sellers.id),
    })
    .from(sellers)
    .where(whereClause)
    .groupBy(sellers.picProvince)
    .orderBy(sql`${count(sellers.id)} DESC`);

  return result;
});
