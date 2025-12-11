import { deleteCategory } from "~/lib/db/queries/category";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Category ID is required",
    });
  }

  await deleteCategory(Number(id));
  return { success: true };
});
