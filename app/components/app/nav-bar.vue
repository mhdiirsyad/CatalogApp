<script setup lang="ts">
import { getInitials } from "~/utils/format-initial";

const { loggedIn, user } = useUserSession();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const sellerData = ref<any>(null);

const currentUser = computed(() => user.value as User | null);

// Fetch seller data jika user adalah seller
onMounted(async () => {
  if (loggedIn.value && currentUser.value?.role === "seller") {
    sellerData.value = await authStore.fetchMe();
  }
});

const userInitials = computed(() => {
  if (currentUser.value?.role === "seller" && sellerData.value?.storeName) {
    return getInitials(sellerData.value.storeName);
  }
  if (currentUser.value?.role === "admin" && currentUser.value?.email) {
    return currentUser.value.email.charAt(0).toUpperCase();
  }
  return "?";
});
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink to="/" class="text-xl pl-2 font-bold">
        Catalog App
      </NuxtLink>
    </div>
    <div class="navbar-end gap-2">
      <AppThemeToggle />

      <!-- Seller Logged In -->
      <div v-if="loggedIn && currentUser?.role === 'seller' && sellerData" class="flex flex-row mr-2">
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
        <!-- <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow">
          <li class="menu-title" />
        </ul> -->
      </div>

      <!-- Admin Logged In -->
      <div v-else-if="loggedIn && currentUser?.role === 'admin'" class="flex flex-row mr-2">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content w-10 rounded-full">
            <span class="text-lg">{{ userInitials }}</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-bold">Admin</span>
          <span class="text-xs opacity-60">{{ currentUser.email }}</span>
        </div>
        <!-- <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow">
          <li class="menu-title">
          </li>
        </ul> -->
      </div>

      <!-- Not Logged In -->
      <NuxtLink v-else to="/seller/auth/register" class="btn btn-neutral">
        Daftar Seller
      </NuxtLink>
    </div>
  </div>
</template>
