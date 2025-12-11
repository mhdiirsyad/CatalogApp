<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const { user } = useUserSession();
const productStore = useProductStore();
const {
  products,
  productStatus,
  searchQuery,
  categoryFilter,
  provinceFilter,
  cityFilter,
} = storeToRefs(productStore);
const config = useRuntimeConfig();

const { data: categories } = await useFetch<SelectCategory[]>("/api/category/category");

// Fetch provinces from our database (approved sellers only)
const { data: provinces } = await useFetch<string[]>("/api/guest/locations/provinces", { lazy: true });

// Fetch cities based on selected province
const { data: cities, refresh: refreshCities } = await useFetch<string[]>(
  () => `/api/guest/locations/cities?province=${provinceFilter.value}`,
  {
    lazy: true,
    immediate: false,
    watch: false,
  },
);

// Handle province change
async function onProvinceChange() {
  cityFilter.value = ""; // Reset city filter

  if (provinceFilter.value) {
    await refreshCities();
  }
}

const searchInput = ref("");

// Debounce search
let debounceTimeout: NodeJS.Timeout;
watch(searchInput, (newValue) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchQuery.value = newValue;
  }, 500);
});

onMounted(() => {
  productStore.productRefresh();
});
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <!-- Hero Section -->
    <div class="bg-linear-to-br from-primary to-secondary max-w-[1200px] mx-auto rounded-3xl shadow-lg mt-4">
      <div class="container max-w-[1200px] mx-auto px-4 py-16">
        <div class="hero-content text-center text-primary-content">
          <div class="max-w-2xl">
            <div class="mb-4">
              <Icon name="tabler:shopping-bag" size="64" class="mx-auto opacity-90" />
            </div>
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
              {{ config.public.siteName }}
            </h1>
            <p class="text-lg md:text-xl mb-8 opacity-90">
              Platform katalog produk terpercaya untuk seller memamerkan produk mereka kepada ribuan calon pembeli di seluruh Indonesia.
            </p>
            <div class="flex flex-wrap gap-4 justify-center">
              <button v-if="user && (user as User).role === 'seller'" class="btn btn-neutral btn-lg gap-2" @click="navigateTo('/seller/dashboard')">
                <Icon name="tabler:dashboard" size="24" />
                Dashboard Seller
                <Icon name="tabler:arrow-right" size="20" />
              </button>
              <button v-else-if="user && (user as User).role === 'admin'" class="btn btn-neutral btn-lg gap-2" @click="navigateTo('/admin/dashboard')">
                <Icon name="tabler:shield-check" size="24" />
                Dashboard Admin
                <Icon name="tabler:arrow-right" size="20" />
              </button>
              <button v-else class="btn btn-neutral btn-lg gap-2" @click="navigateTo('/seller/auth/register')">
                <Icon name="tabler:user-plus" size="24" />
                Daftar Sebagai Seller
                <Icon name="tabler:arrow-right" size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container max-w-[1200px] mx-auto px-4 py-8">
      <!-- Filter Section -->
      <div class="card bg-base-100 shadow-lg mb-8">
        <div class="card-body">
          <h2 class="card-title mb-4 flex items-center gap-2">
            <Icon name="tabler:filter" size="24" />
            Cari & Filter Produk
          </h2>

          <!-- Search Bar -->
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text font-semibold">Cari Produk</span>
            </label>
            <label class="input input-bordered flex items-center gap-2 input-lg">
              <Icon name="tabler:search" size="24" class="opacity-70" />
              <input
                v-model="searchInput"
                type="search"
                placeholder="Cari berdasarkan nama produk atau toko..."
                class="grow"
              >
            </label>
          </div>

          <!-- Filters Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Category Filter -->
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:category" size="18" />
                  Kategori
                </span>
              </label>
              <select v-model="categoryFilter" class="select select-bordered w-full">
                <option :value="null">
                  Semua Kategori
                </option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Province Filter -->
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:map-pin" size="18" />
                  Provinsi
                </span>
              </label>
              <select v-model="provinceFilter" class="select select-bordered w-full" @change="onProvinceChange">
                <option value="">
                  Semua Provinsi
                </option>
                <option
                  v-for="province in provinces"
                  :key="province"
                  :value="province"
                >
                  {{ province }}
                </option>
              </select>
            </div>

            <!-- City Filter -->
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:building-community" size="18" />
                  Kota/Kabupaten
                </span>
              </label>
              <select
                v-model="cityFilter"
                class="select select-bordered w-full"
                :disabled="!provinceFilter"
                :class="{ 'select-disabled': !provinceFilter }"
              >
                <option value="">
                  {{ provinceFilter ? 'Semua Kota/Kabupaten' : 'Pilih provinsi terlebih dahulu' }}
                </option>
                <option
                  v-for="city in cities"
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </option>
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="searchQuery || categoryFilter || provinceFilter || cityFilter" class="mt-4 flex flex-wrap gap-2 items-center">
            <span class="text-sm font-semibold opacity-70">Filter Aktif:</span>
            <div v-if="searchQuery" class="badge badge-primary gap-2">
              <Icon name="tabler:search" size="14" />
              {{ searchQuery }}
              <button class="btn btn-ghost btn-xs btn-circle" @click="searchInput = ''; searchQuery = ''">
                <Icon name="tabler:x" size="14" />
              </button>
            </div>
            <div v-if="categoryFilter" class="badge badge-secondary gap-2">
              <Icon name="tabler:category" size="14" />
              {{ categories?.find(c => c.id === categoryFilter)?.name }}
              <button class="btn btn-ghost btn-xs btn-circle" @click="categoryFilter = null">
                <Icon name="tabler:x" size="14" />
              </button>
            </div>
            <div v-if="provinceFilter" class="badge badge-accent gap-2">
              <Icon name="tabler:map-pin" size="14" />
              {{ provinceFilter }}
              <button class="btn btn-ghost btn-xs btn-circle" @click="provinceFilter = ''; cityFilter = ''">
                <Icon name="tabler:x" size="14" />
              </button>
            </div>
            <div v-if="cityFilter" class="badge badge-info gap-2">
              <Icon name="tabler:building-community" size="14" />
              {{ cityFilter }}
              <button class="btn btn-ghost btn-xs btn-circle" @click="cityFilter = ''">
                <Icon name="tabler:x" size="14" />
              </button>
            </div>
            <button
              class="btn btn-sm btn-ghost gap-2"
              @click="searchInput = ''; searchQuery = ''; categoryFilter = null; provinceFilter = ''; cityFilter = ''"
            >
              <Icon name="tabler:x" size="16" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <Icon name="tabler:package" size="28" />
          Produk Tersedia
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="productStatus === 'pending'" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="mt-4 text-base-content/60">
          Memuat produk...
        </p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!products || products.length === 0" class="card bg-base-100 shadow-lg">
        <div class="card-body items-center text-center py-20">
          <Icon name="tabler:package-off" size="64" class="text-base-content/30 mb-4" />
          <h3 class="text-xl font-bold mb-2">
            Tidak ada produk ditemukan
          </h3>
          <p class="text-base-content/60 mb-4">
            Coba ubah filter pencarian atau hapus beberapa filter
          </p>
          <button
            class="btn btn-primary gap-2"
            @click="searchInput = ''; searchQuery = ''; categoryFilter = null; provinceFilter = ''; cityFilter = ''"
          >
            <Icon name="tabler:refresh" size="20" />
            Reset Filter
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          @click="navigateTo({ name: `slug`, params: { slug: product.slug } })"
        >
          <figure class="relative overflow-hidden bg-base-200">
            <img
              :src="`${config.public.s3PublicUrl}/${product.productImages[0]?.imageUrl}` || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'"
              :alt="product.name"
              class="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
            >
            <div class="absolute top-2 right-2">
              <div class="badge badge-primary badge-sm">
                {{ product.category.name }}
              </div>
            </div>
          </figure>
          <div class="card-body p-4">
            <h2 class="card-title text-base line-clamp-2 min-h-12">
              {{ product.name }}
            </h2>
            <p class="text-sm text-base-content/70 line-clamp-2 min-h-10">
              {{ product.description }}
            </p>
            <div class="mt-2">
              <p class="text-xl font-bold text-primary">
                {{ formatRupiah(product.price) }}
              </p>
            </div>
            <div class="card-actions justify-between items-center mt-2">
              <div v-if="(product as any).seller?.storeName" class="flex items-center gap-1 text-xs text-base-content/60">
                <Icon name="tabler:building-store" size="14" />
                <span class="line-clamp-1">{{ (product as any).seller.storeName }}</span>
              </div>
              <div v-if="(product as any).seller?.picCity" class="flex items-center gap-1 text-xs text-base-content/60">
                <Icon name="tabler:map-pin" size="14" />
                <span>{{ (product as any).seller.picCity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
