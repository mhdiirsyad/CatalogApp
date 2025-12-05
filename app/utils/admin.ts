import z from "zod";

export const AdminLoginSchema = z.object({
  username: z.string().nonempty("Username Tidak Boleh Kosong"),
  password: z.string().nonempty("Password tidak boleh kosong"),
});
