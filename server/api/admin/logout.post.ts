export default defineEventHandler(async (event) => {
  await clearUserSession(event);

  await sendRedirect(event, "/admin/login", 302);
});
