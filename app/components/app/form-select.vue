<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema/category";

defineProps<{
  label: string;
  name: string;
  categories: SelectCategory[];
  placeholder?: string;
}>();
</script>

<template>
  <Field v-slot="{ field, errorMessage }" :name="name" class="w-full">
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        {{ label }}
      </legend>
      <select
        v-bind="field"
        class="select w-full"
        :class="{ 'select-error': errorMessage }"
      >
        <option value="" disabled>
          {{ placeholder || 'Pilih kategori' }}
        </option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <span v-if="errorMessage" class="label text-error">{{ errorMessage }}</span>
    </fieldset>
  </Field>
</template>
