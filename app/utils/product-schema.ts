import z from "zod";

// Helpers: accept empty string from form inputs and coerce to number/undefined
function toNumber(schema: z.ZodNumber) {
  return z.preprocess((val) => {
    if (val === "" || val === null || val === undefined)
      return undefined;
    // If it's already a number, return as-is; otherwise try to coerce
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, schema);
}

export const insertSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  // allow forms to submit empty string; coerce to number and then validate min(1)
  category_id: toNumber(z.number().int().min(1, "Category is required")),
  stock: toNumber(z.number().int().min(1, "Stock is required")),
  // description is optional — allow empty string / undefined
  description: z.string().max(1000, "Description is too long").optional(),
  price: toNumber(z.number().int().min(1, "Price is required")),
  imageKeys: z.array(z.string()).optional(),
  deleteImageKeys: z.array(z.string()).optional(),
});
