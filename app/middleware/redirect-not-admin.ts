export default defineNuxtRouteMiddleware((from, to) => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value || !user.value) {
    return navigateTo("/");
  }

  if (loggedIn.value) {
    console.log(loggedIn.value);
    console.log(user.value);
  }

  if (loggedIn.value && to.path.startsWith("seller")) {
    return navigateTo("admin/dashboard");
  }
});
