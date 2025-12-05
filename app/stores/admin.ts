export default defineStore("useAdminStore", () => {
  const { data: admin, refresh } = useFetch("/api/admin/me");

  async function refreshUser() {
    refresh();
  }

  return {
    admin,
    refreshUser,
  };
});
