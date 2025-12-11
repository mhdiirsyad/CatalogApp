<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const productStore = useProductStore();
const { productStatus, products, searchQuery, categoryFilter } = storeToRefs(productStore);
const config = useRuntimeConfig();

const { data: categories } = await useFetch<SelectCategory[]>("/api/category/category");

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
  <div class="p-6">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold flex items-center gap-2 mb-2">
            <Icon name="tabler:package" size="32" class="text-primary" />
            Kelola Produk
          </h1>
          <p class="text-base-content/60">
            Manage dan monitor semua produk yang Anda jual
          </p>
        </div>
        <NuxtLink to="/seller/dashboard/products/add" class="btn btn-primary btn-lg gap-2">
          <Icon name="tabler:plus" size="24" />
          Tambah Produk Baru
        </NuxtLink>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title mb-4 flex items-center gap-2">
          <Icon name="tabler:filter" size="24" />
          Cari & Filter Produk
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search Bar -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Cari Produk</span>
            </label>
            <label class="input input-bordered flex items-center gap-2">
              <Icon name="tabler:search" size="20" class="opacity-70" />
              <input
                v-model="searchInput"
                type="search"
                placeholder="Cari berdasarkan nama produk..."
                class="grow"
              >
            </label>
          </div>

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
        </div>

        <!-- Active Filters Display -->
        <div v-if="searchQuery || categoryFilter" class="mt-4 flex flex-wrap gap-2 items-center">
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
          <button
            class="btn btn-sm btn-ghost gap-2"
            @click="searchInput = ''; searchQuery = ''; categoryFilter = null"
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
        <Icon name="tabler:list" size="28" />
        Daftar Produk
      </h2>
      <div v-if="products && products.length > 0" class="badge badge-lg badge-neutral">
        {{ products.length }} Produk
      </div>
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
          Belum ada produk
        </h3>
        <p class="text-base-content/60 mb-4">
          {{ searchQuery || categoryFilter ? 'Tidak ada produk yang sesuai dengan filter. Coba ubah filter pencarian.' : 'Mulai tambahkan produk pertama Anda untuk ditampilkan di katalog.' }}
        </p>
        <div class="flex gap-2">
          <button
            v-if="searchQuery || categoryFilter"
            class="btn btn-outline gap-2"
            @click="searchInput = ''; searchQuery = ''; categoryFilter = null"
          >
            <Icon name="tabler:refresh" size="20" />
            Reset Filter
          </button>
          <NuxtLink to="/seller/dashboard/products/add" class="btn btn-primary gap-2">
            <Icon name="tabler:plus" size="20" />
            Tambah Produk
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
        @click="navigateTo({ name: `seller-dashboard-products-slug`, params: { slug: product.slug } })"
      >
        <figure class="relative overflow-hidden bg-base-200">
          <img
            :src="`${config.public.s3PublicUrl}/${product.productImages[0]?.imageUrl}` || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'"
            :alt="product.name"
            class="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-300"
          >
          <div class="absolute top-2 right-2">
            <div class="badge badge-primary">
              {{ product.category.name }}
            </div>
          </div>
          <!-- Stock Badge -->
          <div class="absolute bottom-2 left-2">
            <div
              class="badge"
              :class="{
                'badge-error': product.stock === 0,
                'badge-warning': product.stock > 0 && product.stock < 10,
                'badge-success': product.stock >= 10,
              }"
            >
              <Icon
                :name="product.stock === 0 ? 'tabler:alert-circle' : 'tabler:package'"
                size="14"
                class="mr-1"
              />
              {{ product.stock === 0 ? 'Habis' : `Stok: ${product.stock}` }}
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
          <div class="card-actions justify-between items-center mt-2 pt-2 border-t">
            <div class="flex items-center gap-1 text-xs text-base-content/60">
              <Icon name="tabler:star-filled" size="14" class="text-warning" />
              <span>{{ product.rating || '0.0' }}</span>
            </div>
            <div class="flex gap-1">
              <button
                class="btn btn-sm btn-ghost btn-circle"
                @click.stop="navigateTo({ name: `seller-dashboard-products-slug-edit`, params: { slug: product.slug } })"
              >
                <Icon name="tabler:edit" size="18" />
              </button>
              <button class="btn btn-sm btn-primary btn-circle">
                <Icon name="tabler:eye" size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
