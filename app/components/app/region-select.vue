<script lang="ts" setup>
import { Field, useField } from "vee-validate";
import { onMounted, watch } from "vue";

type Region = { id?: string; code?: string; name: string };

const props = defineProps<{
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  options: any[];
  modelValue?: any | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Region | null): void;
  (e: "change", value: Region | null): void;
}>();

// keep access to the field value so we can programmatically set it when parent provides modelValue
const { value: fieldValue } = useField<string>(props.name);

// Internal state for select (uses ID)
const selectedId = ref<string>("");

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  selectedId.value = target.value;
  const found = props.options.find(o => (o.id ?? o.code) === target.value) ?? null;

  // Set field value to name instead of id
  if (found) {
    fieldValue.value = found.name;
  }
  else {
    fieldValue.value = "";
  }

  emit("update:modelValue", found);
  emit("change", found);
}

onMounted(() => {
  if (props.modelValue) {
    selectedId.value = props.modelValue.id ?? props.modelValue.code ?? "";
    fieldValue.value = props.modelValue.name ?? "";
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedId.value = newValue.id ?? newValue.code ?? "";
      fieldValue.value = newValue.name ?? "";
    }
    else {
      selectedId.value = "";
      fieldValue.value = "";
    }
  },
);
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>

    <Field v-slot="{ errorMessage }" :name="props.name">
      <select
        v-model="selectedId"
        class="select w-full"
        :class="{ 'select-error': props.error || errorMessage }"
        :disabled="props.disabled"
        :aria-invalid="!!(props.error || errorMessage)"
        :aria-describedby="props.error || errorMessage ? `${props.name}-error` : undefined"
        @change="onChange"
      >
        <option disabled value="">
          {{ props.placeholder ?? 'Pilih Opsi' }}
        </option>
        <option
          v-for="option in props.options"
          :key="option.id ?? option.code"
          :value="option.id ?? option.code"
          :data-name="option.name"
        >
          {{ option.name }}
        </option>
      </select>

      <span v-if="props.error || errorMessage" :id="`${props.name}-error`" class="label text-error">
        {{ props.error ?? errorMessage }}
      </span>
    </Field>
  </fieldset>
</template>
