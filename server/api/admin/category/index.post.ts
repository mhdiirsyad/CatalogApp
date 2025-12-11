import { createCategory } from "~/lib/db/queries/category";
import { InsertCategory } from "~/lib/db/schema/category";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const body = await readBody(event);
  const validatedData = InsertCategory.parse(body);

  const category = await createCategory(validatedData);
  return category;
});
