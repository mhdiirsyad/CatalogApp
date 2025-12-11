<script setup lang="ts">
import type { RuntimeConfig } from "nuxt/schema";

import type { SelectProductFull } from "~/lib/db/schema";

defineProps<{
  selectedProduct: SelectProductFull;
  config: RuntimeConfig;
  prevImage: () => void;
  nextImage: () => void;
  selectImage: (index: number) => void;
  formatRupiah: any;
  showActions?: boolean;
}>();

const config = useRuntimeConfig();

const currentImageIndex = defineModel<number>("currentImageIndex", { required: true });
const totalImages = defineModel<number>("totalImages", { required: true });
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 rounded-xl card bg-base-100 shadow-xl">
    <!-- Image Section -->
    <div class="flex flex-col gap-4">
      <figure class="relative rounded-xl overflow-hidden bg-base-200 aspect-square group">
        <img
          v-if="selectedProduct.productImages[currentImageIndex]"
          class="w-full h-full object-cover"
          :src="`${config.public.s3PublicUrl}/${selectedProduct.productImages[currentImageIndex]?.imageUrl}`"
          alt="Product Image"
        >
        <img
          v-else
          class="w-full h-full object-cover"
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Placeholder"
        >

        <!-- Navigation buttons -->
        <button
          v-if="totalImages > 1"
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          @click="prevImage"
        >
          <Icon name="tabler:chevron-left" size="20" />
        </button>
        <button
          v-if="totalImages > 1"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          @click="nextImage"
        >
          <Icon name="tabler:chevron-right" size="20" />
        </button>

        <!-- Image counter -->
        <div v-if="totalImages > 1" class="absolute bottom-4 right-4 bg-base-100/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
          {{ currentImageIndex + 1 }} / {{ totalImages }}
        </div>
      </figure>

      <!-- Thumbnails -->
      <div v-if="totalImages > 0" class="flex gap-3 overflow-x-auto p-2">
        <button
          v-for="(image, index) in selectedProduct.productImages"
          :key="image.id"
          type="button"
          class="w-20 h-20 bg-base-200 rounded-lg shrink-0 overflow-hidden border-2 transition-all hover:scale-105"
          :class="currentImageIndex === index ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-base-300'"
          @click="selectImage(index)"
        >
          <img
            class="w-full h-full object-cover"
            :src="`${config.public.s3PublicUrl}/${image.imageUrl}`"
            alt="Thumbnail"
          >
        </button>
      </div>
    </div>

    <!-- Product Details Section -->
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-3 leading-tight">
            {{ selectedProduct?.name }}
          </h1>

          <!-- Rating -->
          <div class="flex items-center gap-3 mb-2">
            <div class="flex items-center gap-1">
              <Icon
                v-for="star in 5"
                :key="star"
                name="tabler:star-filled"
                size="20"
                :class="star <= Math.round(selectedProduct.rating) ? 'text-warning' : 'text-base-content/20'"
              />
            </div>
            <span class="text-lg font-bold">{{ selectedProduct?.rating.toFixed(1) }}</span>
            <span class="text-sm text-base-content/60">
              ({{ selectedProduct?.reviews.length }} review{{ selectedProduct?.reviews.length !== 1 ? 's' : '' }})
            </span>
          </div>

          <!-- Category Badge -->
          <div class="badge badge-primary badge-lg gap-2">
            <Icon name="tabler:category" size="16" />
            {{ selectedProduct?.category.name }}
          </div>
        </div>

        <!-- Action buttons slot -->
        <div v-if="showActions" class="flex gap-2">
          <slot name="actions" />
        </div>
      </div>

      <!-- Price -->
      <div class="p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
        <p class="text-xs text-base-content/60 mb-1">
          Harga
        </p>
        <p class="text-2xl font-bold text-primary">
          {{ formatRupiah(selectedProduct.price) }}
        </p>
      </div>

      <!-- Stock Info -->
      <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
        <Icon
          :name="selectedProduct.stock > 0 ? 'tabler:package' : 'tabler:package-off'"
          size="20"
          :class="selectedProduct.stock > 0 ? 'text-success' : 'text-error'"
        />
        <div>
          <p class="text-xs text-base-content/60">
            Ketersediaan Stok
          </p>
          <p class="font-semibold text-sm" :class="selectedProduct.stock > 0 ? 'text-success' : 'text-error'">
            {{ selectedProduct.stock > 0 ? `${selectedProduct.stock} unit tersedia` : 'Stok habis' }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <div>
        <h3 class="font-semibold text-lg mb-2 flex items-center gap-2">
          <Icon name="tabler:file-description" size="20" />
          Deskripsi Produk
        </h3>
        <p class="text-base-content/80 leading-relaxed">
          {{ selectedProduct?.description }}
        </p>
      </div>

      <!-- Seller Info -->
      <div class="p-4 bg-base-200 rounded-lg border-l-4 border-primary">
        <div class="flex items-center gap-3 mb-3">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-12">
              <img :src="`${config.public.s3PublicUrl}/${selectedProduct.seller.picUrlPhoto}`" alt="Avatar Seller">
            </div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg">{{ selectedProduct?.seller.storeName }}</span>
              <Icon name="tabler:rosette-discount-check-filled" size="20" class="text-primary" />
            </div>
            <p class="text-sm text-base-content/60">
              Verified Seller
            </p>
          </div>
        </div>

        <!-- Seller Details -->
        <div class="grid grid-cols-1 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <Icon name="tabler:map-pin" size="16" class="text-base-content/60" />
            <span>{{ selectedProduct?.seller.picCity }}, {{ selectedProduct?.seller.picProvince }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="tabler:phone" size="16" class="text-base-content/60" />
            <span>{{ selectedProduct?.seller.picHp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
