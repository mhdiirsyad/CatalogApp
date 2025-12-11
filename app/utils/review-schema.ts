import z from "zod";

// Helper: convert string from form select to number
function toNumber(schema: z.ZodNumber) {
  return z.preprocess((val) => {
    if (val === "" || val === null || val === undefined)
      return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, schema);
}

export const reviewSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(100, "Nama terlalu panjang"),
  noHp: z.string()
    .min(1, "Nomor HP harus diisi")
    .regex(/^08\d{9,11}$/, "Nomor HP harus dimulai dengan 08 dan terdiri dari 11-13 digit"),
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  province: z.string().min(1, "Provinsi harus dipilih"),
  rating: toNumber(z.number().int().min(1, "Rating harus dipilih").max(5, "Rating maksimal 5")),
  comment: z.string().min(1, "Komentar harus diisi").max(500, "Komentar terlalu panjang"),
});

export type ReviewSchema = z.infer<typeof reviewSchema>;
