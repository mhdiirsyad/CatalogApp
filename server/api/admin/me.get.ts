export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const admin = await adminAuth.admin(event);

  return {
    id: admin?.id,
    username: admin?.username,
  };
});
