import { getAllSellers } from "~/lib/db/queries/seller";

export default defineEventHandler(async () => {
  return await getAllSellers();
});
