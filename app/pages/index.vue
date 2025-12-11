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
  <div class="container max-w-[1200px] mx-auto m-4">
    <div class="hero bg-base-300 container mx-auto rounded-lg mt-10">
      <div class="hero-content text-center min-h-64">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">
            Catalog App
          </h1>
          <p class="py-6">
            Aplikasi katalog produk sederhana untuk para seller memamerkan produk
            mereka kepada calon pembeli.
          </p>
          <button v-if="user && (user as User).role === 'seller'" class="btn btn-primary" @click="navigateTo('/seller/dashboard')">
            Dashboard seller <Icon name="tabler:arrow-right" size="24" />
          </button>
          <button v-else-if="user && (user as User).role === 'admin'" class="btn btn-primary" @click="navigateTo('/admin/dashboard')">
            Dashboard Admin <Icon name="tabler:arrow-right" size="24" />
          </button>
          <button v-else class="btn btn-primary" @click="navigateTo('/seller/auth/register')">
            Daftar seller <Icon name="tabler:arrow-right" size="24" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-4 flex justify-between items-center gap-4">
      <div class="flex gap-4">
        <label class="input w-64">
          <Icon name="tabler:search" size="20" class="mr-2" />
          <input
            v-model="searchInput"
            type="search"
            placeholder="Search products..."
          >
        </label>
        <select v-model="categoryFilter" class="select select-bordered w-48">
          <option :value="null">
            All Categories
          </option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <select v-model="provinceFilter" class="select select-bordered w-48" @change="onProvinceChange">
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
        <select v-model="cityFilter" class="select select-bordered w-48" :disabled="!provinceFilter">
          <option value="">
            Semua Kota/Kabupaten
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
    <div class="mt-4">
      <div v-if="productStatus === 'pending'">
        <span class="loading loading-dots loading-xl" />
      </div>
      <div v-else class="grid grid-cols-5 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="card bg-base-100 shadow-sm"
          @click="navigateTo({ name: `slug`, params: { slug: product.slug } })"
        >
          <figure>
            <img
              :src="`${config.public.s3PublicUrl}/${product.productImages[0]?.imageUrl}` || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'"
              alt="Shoes"
              class="h-64 object-cover w-full"
            >
          </figure>
          <div class="card-body">
            <h2 class="card-title">
              {{ product.name }}
            </h2>
            <p>{{ product.description }}</p>
            <p>{{ formatRupiah(product.price) }}</p>
            <div class="card-actions justify-end">
              <div class="badge badge-outline">
                {{ product.category.name }}
              </div>
              <div class="badge badge-outline">
                Products
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
