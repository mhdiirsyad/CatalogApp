type User = any;

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = () => !!user.value;

  function setUser(u: User | null) {
    user.value = u;
  }

  async function fetchMe() {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch<{ user: any }>("/api/auth/me", { credentials: "include" });
      user.value = res.user ?? null;
      return user.value;
    }
    catch (e: any) {
      user.value = null;
      error.value = e?.statusMessage || e?.message || "Failed to fetch user";
      return null;
    }
    finally {
      loading.value = false;
    }
  }

  async function login(payload: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch("/api/seller/login", { method: "post", body: payload, credentials: "include" });
      user.value = res?.user ?? null;
      return res;
    }
    catch (e: any) {
      error.value = e?.statusMessage || e?.data?.message || "Login failed";
      throw e;
    }
    finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      await $fetch("/api/auth/logout", { method: "post", credentials: "include" });
      user.value = null;
    }
    catch (e: any) {
      error.value = e?.statusMessage || e?.data?.message || "Logout failed";
      throw e;
    }
    finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    setUser,
    fetchMe,
    login,
    logout,
  };
});

export default useAuthStore;
