<script setup lang="ts">
import type { FetchError } from "ofetch";

import { reviewSchema } from "~/utils/review-schema";

const route = useRoute();

const productStore = useProductStore();
const {
  selectedProduct,
  selectedProductError,
  selectedProductStatus,
} = storeToRefs(productStore);

const config = useRuntimeConfig();
const { $csrfFetch } = useNuxtApp();

onMounted(() => {
  productStore.selectedProductRefresh();
});

const loading = computed(() => selectedProductStatus.value === "pending");
const isDialogOpen = ref(false);
const isSubmitting = ref(false);
const reviewError = ref("");

// Fetch provinces from Emsifa API
const { data: provinces } = await useFetch<Array<{ id: string; name: string }>>("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");

const { handleSubmit, errors, resetForm, values } = useForm({
  validationSchema: toTypedSchema(reviewSchema),
});

const ratingText = computed(() => {
  const rating = values.rating;
  switch (rating) {
    case 1: return "Sangat Buruk";
    case 2: return "Buruk";
    case 3: return "Cukup";
    case 4: return "Baik";
    case 5: return "Sempurna";
    default: return "Pilih rating";
  }
});

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
  isDialogOpen.value = true;
  reviewError.value = "";
  resetForm();
  (document.activeElement as HTMLAnchorElement).blur();
}

function closeDialog() {
  isDialogOpen.value = false;
  reviewError.value = "";
  resetForm();
}

const onSubmitReview = handleSubmit(async (values) => {
  if (isSubmitting.value)
    return;

  try {
    isSubmitting.value = true;
    reviewError.value = "";

    await $csrfFetch(`/api/guest/review`, {
      method: "post",
      body: {
        ...values,
        slug: route.params.slug,
      },
    });

    // Refresh product to show new review
    await productStore.selectedProductRefresh();

    closeDialog();
  }
  catch (e) {
    const error = e as FetchError;
    reviewError.value = error.statusMessage || "Terjadi kesalahan saat mengirim review";
  }
  finally {
    isSubmitting.value = false;
  }
});

// onBeforeRouteUpdate((to) => {
//   if (to.name === "seller-dashboard-products-slug")
//     productStore.selectedProductRefresh();
// });
</script>

<template>
  <div>
    <div v-if="!selectedProduct && loading" class="flex justify-center items-center h-screen">
      <span class="loading loading-dots loading-xl" />
    </div>
    <div v-if="selectedProduct && !loading" class="container max-w-[1000px] h-screen mx-auto p-8 pt-4">
      <NuxtLink
        to="/"
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
          :format-rupiah="formatRupiah"
        />
        <div class="mt-4 bg-base-100 rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold flex items-center">
              Review Produk
              <span v-if="selectedProduct?.reviews.length > 0" class="text-sm font-normal text-gray-500 ml-2">
                ({{ selectedProduct.reviews.length }} review)
              </span>
            </h2>
            <button class="btn btn-primary" @click="openDialog">
              <Icon name="tabler:message-plus" size="20" />
              Tulis Review
            </button>
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
    <AppFormDialog
      :is-open="isDialogOpen"
      title="Berikan Review"
      :loading="isSubmitting"
      hide-actions
      @close="closeDialog"
    >
      <div v-if="reviewError" class="alert alert-error mb-4">
        <span>{{ reviewError }}</span>
      </div>

      <form @submit.prevent="onSubmitReview">
        <div class="form-control w-full mb-6">
          <label class="label">
            <span class="label-text font-semibold">Rating</span>
          </label>
          <div class="flex flex-col items-center gap-2">
            <Field v-slot="{ field }" name="rating">
              <div class="rating rating-xl">
                <input
                  v-bind="field"
                  type="radio"
                  name="rating"
                  class="mask mask-star-2 bg-primary"
                  :value="1"
                  aria-label="1 star"
                >
                <input
                  v-bind="field"
                  type="radio"
                  name="rating"
                  class="mask mask-star-2 bg-primary"
                  :value="2"
                  aria-label="2 star"
                >
                <input
                  v-bind="field"
                  type="radio"
                  name="rating"
                  class="mask mask-star-2 bg-primary"
                  :value="3"
                  aria-label="3 star"
                >
                <input
                  v-bind="field"
                  type="radio"
                  name="rating"
                  class="mask mask-star-2 bg-primary"
                  :value="4"
                  aria-label="4 star"
                >
                <input
                  v-bind="field"
                  type="radio"
                  name="rating"
                  class="mask mask-star-2 bg-primary"
                  :value="5"
                  aria-label="5 star"
                >
              </div>
            </Field>
            <p class="text-sm font-medium" :class="values.rating ? 'text-primary' : 'text-gray-500'">
              {{ ratingText }}
            </p>
          </div>
          <label v-if="errors.rating" class="label">
            <span class="label-text-alt text-error">{{ errors.rating }}</span>
          </label>
        </div>

        <AppFormField
          label="Nama"
          name="name"
          type="text"
          placeholder="Masukkan nama Anda"
          :error="errors.name"
        />

        <AppFormField
          label="Email"
          name="email"
          type="email"
          placeholder="email@example.com"
          :error="errors.email"
        />

        <AppFormField
          label="Nomor HP"
          name="noHp"
          type="text"
          placeholder="08xxxxxxxxxx"
          :error="errors.noHp"
        />

        <AppRegionSelect
          :options="provinces ?? []"
          label="Provinsi"
          name="province"
          placeholder="Pilih provinsi"
          :error="errors.province"
        />

        <AppFormField
          label="Komentar"
          name="comment"
          type="textarea"
          placeholder="Tulis komentar Anda..."
          :error="errors.comment"
        />

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="isSubmitting"
            @click="closeDialog"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
            Kirim
          </button>
        </div>
      </form>
    </AppFormDialog>
  </div>
</template>
