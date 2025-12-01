<script>
import useAuthStore from "~~/store/auth";

const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.user)
    await authStore.fetchMe();
});
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavBar />
    <main>
      <slot />
    </main>
  </div>
</template>
