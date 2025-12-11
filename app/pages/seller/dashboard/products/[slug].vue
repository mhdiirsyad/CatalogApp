<script setup lang="ts">
import type { FetchError } from "ofetch";

const route = useRoute();
const { $csrfFetch } = useNuxtApp();

const productStore = useProductStore();
const {
  selectedProduct,
  selectedProductError,
  selectedProductStatus,
} = storeToRefs(productStore);

const config = useRuntimeConfig();

onMounted(() => {
  productStore.selectedProductRefresh();
});

const loading = computed(() => selectedProductStatus.value === "pending");
const isOpen = ref(false);
const deleteError = ref("");
const isDeleting = ref(false);

const currentImageIndex = ref(0);

const totalImages = computed(() => selectedProduct.value?.productImages.length || 0);

function nextImage() {
  if (currentImageIndex.value < totalImages.value - 1) {
    currentImageIndex.value++;
  }
  else {
    currentImageIndex.value = 0;
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
  else {
    currentImageIndex.value = totalImages.value - 1;
  }
}

function selectImage(index: number) {
  currentImageIndex.value = index;
}

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

async function confirmDelete() {
  try {
    isDeleting.value = true;
    deleteError.value = "";
    await $csrfFetch(`/api/seller/product/${route.params.slug}`, {
      method: "delete",
    });
    navigateTo("/seller/dashboard/products");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.statusMessage || "An error occured";
  }
  isDeleting.value = false;
}
</script>

<template>
  <div>
    <div v-if="route.name === `seller-dashboard-products-slug` && loading" class="flex justify-center items-center h-screen">
      <span class="loading loading-dots loading-xl" />
    </div>
    <div v-if="route.name === `seller-dashboard-products-slug` && selectedProduct && !loading" class="container max-w-[1000px] h-screen mx-auto p-8 pt-4">
      <NuxtLink
        to="/seller/dashboard/products"
        class="text-md text-primary font-semibold"
      >
        &larr; Kembali
      </NuxtLink>
      <div v-if="selectedProductStatus === 'pending'">
        <span class="loading loading-dots loading-xl" />
      </div>
      <div v-if="selectedProductError" class="text-error">
        {{ selectedProductError }}
      </div>
      <div v-else class="mx-auto mt-4">
        <AppDetailProductCard
          v-model:current-image-index="currentImageIndex"
          v-model:total-images="totalImages"
          :selected-product="selectedProduct"
          :config="config"
          :prev-image="prevImage"
          :next-image="nextImage"
          :select-image="selectImage"
          :format-rupiah="(price: number) => price"
          :show-actions="true"
        >
          <template #actions>
            <div class="tooltip tooltip-bottom" data-tip="Edit">
              <NuxtLink
                :to="`/seller/dashboard/products/${selectedProduct?.slug}/edit`"
                class="btn btn-primary rounded-lg p-0 px-2"
              >
                <Icon name="tabler:edit" size="16" />
              </NuxtLink>
            </div>
            <div class="tooltip tooltip-bottom" data-tip="Hapus">
              <button
                class="btn btn-error rounded-lg p-0 px-2"
                @click="openDialog"
              >
                <Icon name="tabler:trash" size="16" />
              </button>
            </div>
          </template>
        </AppDetailProductCard>
        <div class="mt-4 bg-base-100 rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold flex items-center">
              Review Produk
              <span v-if="selectedProduct?.reviews.length > 0" class="text-sm font-normal text-gray-500 ml-2">
                ({{ selectedProduct.reviews.length }} review)
              </span>
            </h2>
          </div>

          <div v-if="selectedProduct?.reviews.length === 0" class="flex flex-col justify-center items-center h-64 text-center">
            <Icon name="tabler:message-circle-off" size="64" class="text-gray-300 mb-4" />
            <h3 class="font-semibold text-xl text-gray-400 mb-2">
              Belum Ada Review
            </h3>
            <p class="text-gray-500 text-sm">
              Jadilah yang pertama memberikan review untuk produk ini
            </p>
          </div>

          <div v-else class="space-y-4">
            <AppReviewItem :selected-product="selectedProduct" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <NuxtPage />
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Hapus Produk"
      message="Apakah anda yakin ingin menghapus produk ini?"
      button-text="Hapus"
      confim-class="btn-error"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
