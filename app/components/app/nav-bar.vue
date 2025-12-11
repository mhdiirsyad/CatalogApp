<script setup lang="ts">
import { getInitials } from "~/utils/format-initial";

const { loggedIn, user, fetch: refreshSession } = useUserSession();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const sellerData = ref<any>(null);
const isLoadingSeller = ref(false);

const currentUser = computed(() => user.value as User | null);

// Fetch seller data
async function fetchSellerData() {
  if (isLoadingSeller.value)
    return;

  isLoadingSeller.value = true;
  try {
    const data = await authStore.fetchMe();
    sellerData.value = data;
    // Also update authStore.user untuk trigger watchers
    authStore.setUser(data);
  }
  catch (error) {
    console.error("Failed to fetch seller data:", error);
    sellerData.value = null;
    authStore.setUser(null);
  }
  finally {
    isLoadingSeller.value = false;
  }
}

// Watch loggedIn dari useUserSession
watch(
  loggedIn,
  async (isLoggedIn) => {
    if (isLoggedIn) {
      // Refresh session dulu untuk dapat data terbaru
      await refreshSession();
      // Cek role setelah refresh
      if (currentUser.value?.role === "seller") {
        await fetchSellerData();
      }
    }
    else {
      sellerData.value = null;
      authStore.setUser(null);
    }
  },
  { immediate: true },
);

const userInitials = computed(() => {
  if (currentUser.value?.role === "seller" && sellerData.value?.storeName) {
    return getInitials(sellerData.value.storeName);
  }
  if (currentUser.value?.role === "admin") {
    return getInitials(currentUser.value.username || currentUser.value.email);
  }
  return "?";
});
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink to="/" class="text-xl pl-2 font-bold">
        {{ config.public.siteName }}
      </NuxtLink>
    </div>
    <div class="navbar-end gap-2">
      <AppThemeToggle />

      <!-- Seller Logged In -->
      <div v-if="loggedIn && currentUser?.role === 'seller' && sellerData" class="flex flex-row mr-2 items-center">
        <div class="w-10 rounded-full">
          <img
            v-if="sellerData.picUrlPhoto"
            class="text-sm"
            :src="`${config.public.s3PublicUrl}/${sellerData.picUrlPhoto}`"
            :alt="sellerData.storeName"
          >
          <div v-else class="bg-neutral text-neutral-content w-full h-full flex items-center justify-center">
            <span class="text-lg">{{ userInitials }}</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-bold">{{ sellerData.storeName }}</span>
          <span class="text-xs opacity-60">{{ sellerData.picName }}</span>
        </div>
      </div>

      <!-- Admin Logged In -->
      <div v-else-if="loggedIn && currentUser?.role === 'admin'" class="flex flex-row mr-2 gap-2 items-center">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content w-10 rounded-full">
            <img :src="userInitials">
          </div>
        </div>
        <div class="flex flex-col justify-start">
          <span class="font-bold">Admin</span>
          <span class="text-xs opacity-60">{{ currentUser.email }}</span>
        </div>
      </div>

      <!-- Not Logged In -->
      <NuxtLink v-else to="/seller/auth/register" class="btn btn-neutral">
        Daftar Seller
      </NuxtLink>
    </div>
  </div>
</template>
