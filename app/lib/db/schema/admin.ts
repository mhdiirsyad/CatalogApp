import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admin = sqliteTable("admin", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  password: text().notNull(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
