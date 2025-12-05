<script setup lang="ts">
import type { SelectProductFull } from "~/lib/db/schema";

defineProps<{
  selectedProduct: SelectProductFull;
}>();
function avatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128&rounded=true`;
}
</script>

<template>
  <div
    v-for="review in selectedProduct?.reviews"
    :key="review.id"
    class="border border-base-300 rounded-lg p-4 hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="w-12 rounded-full">
            <img :src="avatar(review.name)">
          </div>
        </div>

        <div>
          <h4 class="font-semibold text-base">
            {{ review.name }}
          </h4>
          <div class="flex items-center gap-2 mt-1">
            <div class="rating rating-sm">
              <input
                v-for="star in 5"
                :key="star"
                type="radio"
                class="mask mask-star-2 bg-orange-400"
                :checked="star === review.rating"
                disabled
              >
            </div>
            <span class="text-sm font-medium text-gray-600">
              {{ review.rating }}.0
            </span>
          </div>
        </div>
      </div>
      <div class="text-xs text-gray-500">
        {{ new Date(review.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }) }}
      </div>
    </div>

    <p class="text-gray-700 leading-relaxed ml-15">
      {{ review.comment }}
    </p>
  </div>
</template>
