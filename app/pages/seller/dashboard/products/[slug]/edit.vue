<script setup lang="ts">
import type { FetchError } from "ofetch";

const useProduct = useProductStore();
const { selectedProduct } = storeToRefs(useProduct);
const { $csrfFetch } = useNuxtApp();

const fileFieldRef = ref<{
  uploadImages: () => Promise<string[]>;
  getImagesToDelete: () => string[];
} | null>(null);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(insertSchema),
  initialValues: selectedProduct.value,
});

const { data: categories } = await useFetch("/api/category/category");

const editError = ref("");
const loading = ref(false);
const onSubmit = handleSubmit(async (values) => {
  if (loading.value)
    return;

  try {
    loading.value = true;
    editError.value = "";

    // Upload new images if any selected
    const imageKeys = fileFieldRef.value ? await fileFieldRef.value.uploadImages() : [];

    // Get list of images to delete
    const imagesToDelete = fileFieldRef.value ? fileFieldRef.value.getImagesToDelete() : [];

    await $csrfFetch(`/api/seller/product/${selectedProduct.value?.slug}`, {
      method: "put",
      body: {
        ...values,
        imageKeys: imageKeys.length > 0 ? imageKeys : undefined,
        deleteImageKeys: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      },
    });
    navigateTo("/seller/dashboard/products");
  }
  catch (e) {
    const error = e as FetchError;
    editError.value = error.statusMessage || "An error occured";
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container max-w-md mx-auto">
    <div class="my-4">
      <h1 class="text-xl font-bold">
        Edit Product
      </h1>
    </div>
    <div v-if="editError" class="text-error">
      {{ editError }}
    </div>
    <form @submit.prevent="onSubmit">
      <AppFormField
        label="Product Name"
        name="name"
        type="text"
        placeholder="Enter product name"
        :error="errors.name"
      />
      <AppFormSelect
        label="Category"
        name="category_id"
        :error="errors.category_id"
        :categories="categories ?? []"
      />
      <AppFormField
        label="Stock"
        name="stock"
        type="number"
        placeholder="Enter stock quantity"
        :error="errors.stock"
      />
      <AppFormField
        label="Description"
        name="description"
        type="textarea"
        placeholder="Enter product description"
        :error="errors.description"
      />
      <AppFormField
        label="Price"
        name="price"
        type="number"
        placeholder="Enter product price"
        :error="errors.price"
      />
      <AppFileField
        ref="fileFieldRef"
        multiple
        label="Product Images (Optional - upload to replace existing)"
        :max-files="5"
        :existing-images="selectedProduct?.productImages?.map(img => img.imageUrl) ?? []"
      />
      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary mt-4" :disabled="loading">
          <span v-if="loading">Updating...</span>
          <span v-else>
            <Icon name="tabler:edit" size="24" />
            Edit Product
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
