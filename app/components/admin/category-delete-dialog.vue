<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const props = defineProps<{
  isOpen: boolean;
  category?: SelectCategory;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    dialogRef.value?.showModal();
  }
  else {
    dialogRef.value?.close();
  }
});
</script>

<template>
  <dialog ref="dialogRef" class="modal" @close="emit('close')">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        Delete Category
      </h3>

      <div class="alert alert-warning mb-4">
        <Icon name="tabler:alert-triangle" size="20" />
        <span>This action cannot be undone!</span>
      </div>

      <p class="mb-4">
        Are you sure you want to delete category <strong>{{ category?.name }}</strong>?
      </p>

      <div class="modal-action">
        <button class="btn" @click="emit('close')">
          Cancel
        </button>
        <button class="btn btn-error" @click="emit('confirm')">
          Delete
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
