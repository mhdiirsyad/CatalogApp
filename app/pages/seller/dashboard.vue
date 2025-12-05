<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const { $csrfFetch } = useNuxtApp();
async function handleLogout() {
  try {
    await $csrfFetch("/api/auth/logout", {
      method: "post",
    });
    await navigateTo("/seller/auth/login");
  }
  catch (e) {
    console.error("Logout failed", e);
  }
}

const isSidebarOpen = ref(true);
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("seller-sidebar-open", isSidebarOpen.value ? "true" : "false");
}
</script>

<template>
  <div class="flex-1 flex">
    <div class="bg-base-200 transition-all duration-200" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
      <div class="flex mb-4" :class="{ 'justify-end': isSidebarOpen, 'justify-center': !isSidebarOpen }" @click="toggleSidebar">
        <Icon v-if="isSidebarOpen" name="tabler:layout-sidebar-left-collapse" size="30" />
        <Icon v-else name="tabler:layout-sidebar-left-expand" size="30" />
      </div>
      <div class="flex flex-col">
        <AppSidebarItem
          to="/seller/dashboard"
          icon="tabler:layout-dashboard-filled"
          label="Dashboard"
          :label-show="isSidebarOpen"
        />
        <AppSidebarItem
          to="/seller/dashboard/products"
          icon="tabler:box-seam"
          label="Products"
          :label-show="isSidebarOpen"
        />
        <div class="divider" />
        <AppSidebarItem
          to="/seller/dashboard/profile"
          icon="tabler:user"
          label="Profile"
          :label-show="isSidebarOpen"
        />
        <div class="tooltip-right" :data-tip="isSidebarOpen ? undefined : 'Logout'" :class="{ tooltip: !isSidebarOpen }">
          <button class="btn btn-ghost justify-start" @click="handleLogout">
            <Icon name="tabler:logout-2" size="24" />
            <span v-if="isSidebarOpen">Logout</span>
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1">
      <NuxtPage />
    </div>
  </div>
</template>
