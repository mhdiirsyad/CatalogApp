<script setup lang="ts">
import type { FetchError } from "ofetch";

import type { SelectCategory } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp();

const fileFieldRef = ref<{ uploadImages: () => Promise<string[]> } | null>(null);
const submitting = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(insertSchema),
});

const { data: categories } = await useFetch<SelectCategory[]>("/api/category/category");

const onSubmit = handleSubmit(async (values) => {
  if (submitting.value)
    return;

  try {
    submitting.value = true;

    // Upload images first
    const imageKeys = fileFieldRef.value ? await fileFieldRef.value.uploadImages() : [];

    // Create product with image keys
    await $csrfFetch("/api/seller/product", {
      method: "post",
      body: {
        ...values,
        imageKeys,
      },
    });

    navigateTo("/seller/dashboard/products");
  }
  catch (e) {
    const error = e as FetchError;
    console.error("Error adding product:", error);
  }
  finally {
    submitting.value = false;
  }
});
</script>

<template>
  <div class="container max-w-md mx-auto">
    <div
      class="text-md text-primary font-semibold cursor-pointer mt-4"
      @click="useRouter().back()"
    >
      &larr; Kembali
    </div>
    <div class="my-4">
      <h1 class="text-xl font-bold">
        Add Product
      </h1>
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
        :categories="categories ?? []"
        :error="errors.category_id"
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
        label="Product Images"
        :max-files="5"
      />
      <button type="submit" class="btn btn-primary mt-4" :disabled="submitting">
        <span v-if="submitting">Creating Product...</span>
        <span v-else class="flex flex-row items-center gap-2">
          <Icon name="tabler:square-rounded-plus-filled" size="24" />
          Add Product
        </span>
      </button>
    </form>
  </div>
</template>
