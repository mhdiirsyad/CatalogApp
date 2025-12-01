export default defineNuxtRouteMiddleware(async () => {
  try {
    // if authenticated, redirect away from auth pages
    if (import.meta.server) {
      const cookie = useRequestHeaders().cookie;
      if (cookie) {
        await $fetch("/api/auth/me", { headers: { cookie } });
        return navigateTo("/seller/dashboard");
      }
    }
    else {
      await $fetch("/api/auth/me", { credentials: "include" });
      return navigateTo("/seller/dashboard");
    }
  }
  catch {
    // not authenticated => allow access
  }
});
