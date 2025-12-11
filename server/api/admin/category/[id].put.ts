import { updateCategory } from "~/lib/db/queries/category";
import { UpdateCategory } from "~/lib/db/schema/category";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Category ID is required",
    });
  }

  const body = await readBody(event);
  const validatedData = UpdateCategory.parse(body);

  const category = await updateCategory(Number(id), validatedData);
  return category;
});
