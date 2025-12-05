import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const provinces = sqliteTable("provinces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const regencies = sqliteTable("regencies", {
  id: text("id").primaryKey(),
  provinceId: text("province_id").notNull().references(() => provinces.id),
  name: text("name").notNull(),
});

export const districts = sqliteTable("districts", {
  id: text("id").primaryKey(),
  regencyId: text("regency_id").notNull().references(() => regencies.id),
  name: text("name").notNull(),
});

export const villages = sqliteTable("villages", {
  id: text("id").primaryKey(),
  districtId: text("district_id").notNull().references(() => districts.id),
  name: text("name").notNull(),
});
