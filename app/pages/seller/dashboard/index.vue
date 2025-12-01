<script setup lang="ts">
definePageMeta({ middleware: "auth" });
async function handleLogout() {
  try {
    await $fetch("/api/auth/logout", {
      method: "post",
    });
    await navigateTo("/seller/auth/login");
  }
  catch (e) {
    console.error("Logout failed", e);
  }
}
</script>

<template>
  <div>
    <h1>dashboard seller</h1>
    <button class="btn btn-primary" @click="handleLogout">
      Logout
    </button>
  </div>
</template>
