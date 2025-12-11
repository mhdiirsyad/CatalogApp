<script setup lang="ts">
definePageMeta({
  middleware: ["redirect-not-admin"],
});

async function handleLogout() {
  try {
    const { $csrfFetch } = useNuxtApp();
    await $csrfFetch("/api/auth/logout", {
      method: "post",
    });
    await navigateTo("/admin/login");
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
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar - Fixed, tidak scroll -->
    <div
      class="bg-base-200 transition-all duration-200 flex flex-col h-screen"
      :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }"
    >
      <!-- Toggle Button -->
      <div
        class="flex mb-4 p-4 cursor-pointer"
        :class="{ 'justify-end': isSidebarOpen, 'justify-center': !isSidebarOpen }"
        @click="toggleSidebar"
      >
        <Icon v-if="isSidebarOpen" name="tabler:layout-sidebar-left-collapse" size="30" />
        <Icon v-else name="tabler:layout-sidebar-left-expand" size="30" />
      </div>

      <!-- Menu Items - Scrollable jika menu terlalu banyak -->
      <div class="flex flex-col flex-1 overflow-y-auto">
        <AppSidebarItem
          to="/admin/dashboard"
          icon="tabler:layout-dashboard-filled"
          label="Dashboard"
          :label-show="isSidebarOpen"
        />
        <AppSidebarItem
          to="/admin/dashboard/categories"
          icon="tabler:category"
          label="Category"
          :label-show="isSidebarOpen"
        />
        <AppSidebarItem
          to="/admin/dashboard/sellers"
          icon="tabler:user"
          label="Seller"
          :label-show="isSidebarOpen"
        />
        <div class="divider" />
        <!-- <AppSidebarItem
          to="/admin/dashboard/profile"
          icon="tabler:user"
          label="Profile"
          :label-show="isSidebarOpen"
        /> -->
        <div class="tooltip-right" :data-tip="isSidebarOpen ? undefined : 'Logout'" :class="{ tooltip: !isSidebarOpen }">
          <button class="btn btn-ghost w-full justify-start" @click="handleLogout">
            <Icon name="tabler:logout-2" size="24" />
            <span v-if="isSidebarOpen" class="font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content - Scrollable -->
    <div class="flex-1 overflow-y-auto">
      <NuxtPage />
    </div>
  </div>
</template>
