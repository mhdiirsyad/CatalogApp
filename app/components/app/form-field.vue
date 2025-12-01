<script lang="ts" setup>
const props = defineProps<{
  label: string;
  name: string;
  type?: "text" | "password" | "email" | "number" | "textarea" | "select";
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      :as="props.type === 'textarea' ? props.type : 'input'"
      :name="props.name"
      :type="props.type || 'text'"
      :disabled="props.disabled"
      class="w-full"
      :class="{
        'input-error': props.error,
        'input': !props.type || props.type !== 'textarea',
        'textarea': props.type === 'textarea',
      }"
      :placeholder="props.placeholder ?? ''"
    />
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
