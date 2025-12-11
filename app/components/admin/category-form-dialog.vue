<script setup lang="ts">
import type { ZodSchema } from "zod";

import { toTypedSchema } from "@vee-validate/zod";

import type { InputCategory } from "~/lib/db/schema/category";

import { InsertCategory } from "~/lib/db/schema/category";

const props = defineProps<{
  isOpen: boolean;
  category?: InputCategory & { id?: number };
  mode: "add" | "edit";
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const { handleSubmit, errors, setErrors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(InsertCategory as unknown as ZodSchema<InputCategory>),
});

const { $csrfFetch } = useNuxtApp();
const loading = ref(false);
const submitError = ref("");

// Generate slug from name
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;
    submitError.value = "";

    if (props.mode === "edit" && props.category?.id) {
      await $csrfFetch(`/api/admin/category/${props.category.id}`, {
        method: "PUT",
        body: values,
      });
    }
    else {
      await $csrfFetch("/api/admin/category", {
        method: "POST",
        body: values,
      });
    }

    emit("success");
    resetForm();
  }
  catch (error: any) {
    if (error.data?.data) {
      setErrors(error.data.data);
    }
    submitError.value = error.statusMessage || "An error occurred";
  }
  finally {
    loading.value = false;
  }
});

// Watch for category changes to populate form in edit mode
watch(() => props.category, (newCategory) => {
  if (newCategory && props.mode === "edit") {
    setValues({
      name: newCategory.name,
      description: newCategory.description || "",
      slug: newCategory.slug,
    });
  }
}, { immediate: true });

// Watch for dialog close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
    submitError.value = "";
  }
});
</script>

<template>
  <AppFormDialog
    :is-open="isOpen"
    :title="mode === 'add' ? 'Add Category' : 'Edit Category'"
    :loading="loading"
    @close="emit('close')"
    @confirm="onSubmit"
  >
    <div v-if="submitError" role="alert" class="alert alert-error mb-4">
      <Icon name="tabler:alert-circle" size="20" />
      <span>{{ submitError }}</span>
    </div>

    <form class="space-y-4">
      <Field v-slot="{ field }" name="name" class="w-full">
        <fieldset class="fieldset">
          <label class="label">
            <span class="label-text">Category Name</span>
          </label>
          <input
            v-bind="field"
            type="text"
            placeholder="Enter category name"
            class="input w-full"
            :class="{ 'input-error': errors.name }"
            :disabled="loading"
            @input="(e) => {
              field.onInput(e);
              // Auto-generate slug from name
              if (mode === 'add') {
                setValues({ slug: generateSlug((e.target as HTMLInputElement).value) });
              }
            }"
          >
          <label v-if="errors.name" class="label">
            <span class="label-text-alt text-error">{{ errors.name }}</span>
          </label>
        </fieldset>
      </Field>

      <Field v-slot="{ field }" name="description">
        <fieldset class="fieldset">
          <label class="label">
            <span class="label-text">Description (Optional)</span>
          </label>
          <textarea
            v-bind="field"
            placeholder="Enter category description"
            class="textarea w-full"
            :class="{ 'textarea-error': errors.description }"
            :disabled="loading"
            rows="3"
          />
          <label v-if="errors.description" class="label">
            <span class="label-text-alt text-error">{{ errors.description }}</span>
          </label>
        </fieldset>
      </Field>

      <Field v-slot="{ field }" name="slug">
        <fieldset class="fieldset">
          <label class="label">
            <span class="label-text">Slug</span>
          </label>
          <input
            v-bind="field"
            type="text"
            placeholder="category-slug"
            class="input w-full"
            :class="{ 'input-error': errors.slug }"
            :disabled="loading"
          >
          <label v-if="errors.slug" class="label">
            <span class="label-text-alt text-error">{{ errors.slug }}</span>
          </label>
          <label v-else class="label">
            <span class="label-text-alt">URL-friendly identifier (lowercase, hyphens only)</span>
          </label>
        </fieldset>
      </Field>
    </form>
  </AppFormDialog>
</template>
