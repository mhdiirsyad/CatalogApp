import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sellers = sqliteTable("sellers", {
  id: int().primaryKey({ autoIncrement: true }),
  storeName: text().notNull(),
  description: text().notNull(),
  picName: text().notNull(),
  picHp: text().notNull().unique(),
  picEmail: text().notNull().unique(),
  password: text().notNull(),
  address: text().notNull(),
  picRT: int().notNull(),
  picRW: int().notNull(),
  picProvince: text().notNull(),
  picCity: text().notNull(),
  picDistrict: text().notNull(),
  picVillage: text().notNull(),
  picNoKTP: text().notNull(),
  picUrlKTP: text().notNull(),
  picUrlPhoto: text().notNull(),
  status: text({ enum: ["PENDING", "APPROVED", "CANCELLED"] }).notNull().$default(() => "PENDING"),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
  verifiedAt: int(),
});

export const InsertSeller = createInsertSchema(sellers, {
  storeName: field => field.min(1, "Store name is required").max(100),
  description: field => field.min(1, "Description is required").max(255),
  picName: field => field.min(1, "PIC name is required").max(100),
  picHp: field =>
    field
      .min(11, "Phone number must be at least 11 characters")
      .max(15, "Phone number must be at most 15 characters")
      .regex(/^\+?\d+$/, "Phone number must contain only digits and optional leading +"),
  picEmail: field => field.email("Invalid email address"),
  password: field =>
    field
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
        "Password must include uppercase, lowercase, number and special character",
      ),
  address: field => field.min(5, "Address is too short").max(255),
  picRT: field => field.int().min(1, "RT is required").max(999),
  picRW: field => field.int().min(1, "RW is required").max(999),
  picProvince: field => field.min(1, "Province is required").max(100),
  picCity: field => field.min(1, "City is required").max(100),
  picDistrict: field => field.min(1, "District is required").max(100),
  picVillage: field => field.min(1, "Village is required").max(100),
  picNoKTP: field =>
    field
      .length(16, "KTP must be exactly 16 digits")
      .regex(/^\d{16}$/, "KTP must contain only digits"),
  picUrlKTP: field => field.min(1, "Invalid KTP URL"),
  picUrlPhoto: field => field.min(1, "Invalid photo URL"),
  status: field => field.optional(), // defaults to "PENDING" in schema
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
});

// Schema for registration form (without file URLs since they're uploaded separately)
export const InsertSellerForm = InsertSeller.extend({
  picUrlKTP: InsertSeller.shape.picUrlKTP.optional(),
  picUrlPhoto: InsertSeller.shape.picUrlPhoto.optional(),
});

export const selectSeller = createSelectSchema(sellers);
export type InputSeller = ReturnType<typeof InsertSeller.parse>;
export type InputSellerForm = ReturnType<typeof InsertSellerForm.parse>;
export type SelectSeller = typeof sellers.$inferSelect;
