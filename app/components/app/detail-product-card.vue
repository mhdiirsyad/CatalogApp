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
const currentImageIndex = defineModel<number>("currentImageIndex", { required: true });
const totalImages = defineModel<number>("totalImages", { required: true });
</script>

<template>
  <div class="p-4 rounded-lg card bg-base-100 shadow-sm flex flex-row w-full">
    <div class="flex flex-col gap-2">
      <figure class="w-96 h-96 rounded-md relative group">
        <img
          v-if="selectedProduct.productImages[currentImageIndex]"
          class="object-fit"
          :src="`${config.public.s3PublicUrl}/${selectedProduct.productImages[currentImageIndex]?.imageUrl}`"
          alt="Product Image"
        >
        <img
          v-else
          class="object-fit"
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Placeholder"
        >
        <!-- Navigation buttons -->
        <button
          v-if="totalImages > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
          @click="prevImage"
        >
          ❮
        </button>
        <button
          v-if="totalImages > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
          @click="nextImage"
        >
          ❯
        </button>
        <!-- Image counter -->
        <div v-if="totalImages > 1" class="absolute bottom-2 right-2 bg-base-100 bg-opacity-80 px-2 py-1 rounded text-xs">
          {{ currentImageIndex + 1 }} / {{ totalImages }}
        </div>
      </figure>
      <!-- Thumbnails -->
      <div v-if="totalImages > 0" class="flex flex-row gap-2 overflow-x-auto">
        <button
          v-for="(image, index) in selectedProduct.productImages"
          :key="image.id"
          type="button"
          class="w-16 aspect-square bg-accent rounded-md shrink-0 overflow-hidden border-2 transition-all"
          :class="currentImageIndex === index ? 'border-primary' : 'border-transparent'"
          @click="selectImage(index)"
        >
          <img
            class="aspect-square object-cover w-full h-full"
            :src="`${config.public.s3PublicUrl}/${image.imageUrl}`"
            alt="Thumbnail"
          >
        </button>
      </div>
    </div>
    <div class="w-full">
      <div class="card-body py-0">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h2 class="card-title">
              {{ selectedProduct?.name }}
            </h2>
            <div class="flex flex-row gap-1 mt-1">
              <div class="mask mask-star-2 bg-primary w-5" />
              <span class="text-sm font-medium text-gray-600 self-center">
                {{ selectedProduct?.rating.toFixed(1) }}
              </span>
              <div class="text-sm text-gray-500 self-center">
                ({{ selectedProduct?.reviews.length }} review)
              </div>
            </div>
          </div>

          <!-- Action buttons slot -->
          <div v-if="showActions" class="flex flex-row gap-2">
            <slot name="actions" />
          </div>
        </div>
        <p>{{ selectedProduct?.description }}</p>
        <p>Stok: {{ selectedProduct?.stock }}</p>
        <p>Harga: {{ formatRupiah(selectedProduct.price) }}</p>
        <div class="card-actions justify-start">
          <div class="badge badge-outline">
            {{ selectedProduct?.category.name }}
          </div>
          <div class="badge badge-outline">
            Products
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
