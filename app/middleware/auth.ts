export default defineNuxtRouteMiddleware(async (to) => {
  try {
    // call server endpoint to verify session
    if (import.meta.server) {
      const cookie = useRequestHeaders().cookie;
      if (cookie) {
        await $fetch("/api/auth/me", { headers: { cookie } });
      }
      else {
        await $fetch("/api/auth/me");
      }
    }
    else {
      await $fetch("/api/auth/me", { credentials: "include" });
    }
  }
  catch {
    // not authenticated -> redirect to login with redirect back
    const redirect = encodeURIComponent(to.fullPath || "/");
    return navigateTo(`/seller/auth/login?redirect=${redirect}`);
  }
});
