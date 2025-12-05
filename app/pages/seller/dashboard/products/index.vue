<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const productStore = useProductStore();
const { sellerProductStatus, sellerProducts, searchQuery, categoryFilter } = storeToRefs(productStore);
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
  productStore.sellerProductRefresh();
});
</script>

<template>
  <div class="m-4">
    <h1 class="text-xl font-bold">
      Products
    </h1>
    <div class="flex justify-between items-center gap-4">
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
      </div>
      <NuxtLink to="/seller/dashboard/products/add" class="btn btn-primary mb-4">
        <Icon name="tabler:square-rounded-plus-filled" size="24" />
        Add Product
      </NuxtLink>
    </div>
    <div class="mt-4">
      <div v-if="sellerProductStatus === 'pending'">
        <span class="loading loading-dots loading-xl" />
      </div>
      <div v-else class="grid grid-cols-3 gap-4">
        <div
          v-for="product in sellerProducts"
          :key="product.id"
          class="card bg-base-100 shadow-sm"
          @click="navigateTo({ name: `seller-dashboard-products-slug`, params: { slug: product.slug } })"
        >
          <figure>
            <img
              :src="`${config.public.s3PublicUrl}/${product.productImages[0]?.imageUrl}` || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'"
              alt="Shoes"
            >
          </figure>
          <div class="card-body">
            <h2 class="card-title">
              {{ product.name }}
              <div class="badge badge-secondary">
                NEW
              </div>
            </h2>
            <p>{{ product.description }}</p>
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
