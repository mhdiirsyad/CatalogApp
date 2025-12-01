<script lang="ts" setup>
const props = defineProps<{
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  options: string[];
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      as="select"
      :name="props.name"
      class="select w-full"
      :class="{ 'select-error': props.error }"
      :disabled="props.disabled"
      :aria-invalid="!!props.error"
      :aria-describedby="props.error ? `${props.name}-error` : undefined"
    >
      <option disabled value="">
        {{ props.placeholder ?? 'Select an option' }}
      </option>
      <option v-for="option in props.options" :key="option" :value="option">
        {{ option }}
      </option>
    </Field>
    <span v-if="props.error" :id="`${props.name}-error`" class="label text-error">{{ props.error }}</span>
  </fieldset>
</template>
