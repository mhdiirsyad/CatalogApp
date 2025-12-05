<script setup lang="ts">
const props = defineProps<{
  title: string;
  isOpen: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
  loading?: boolean;
  hideActions?: boolean;
}>();

const emits = defineEmits<{
  close: [];
  confirm: [];
}>();

function onClose() {
  if (!props.loading) {
    emits("close");
  }
}

function onConfirm() {
  if (!props.loading) {
    emits("confirm");
  }
}

const dialog = useTemplateRef("dialog");

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    dialog.value?.showModal();
  }
  else {
    dialog.value?.close();
  }
});

onMounted(() => {
  if (dialog.value) {
    dialog.value.addEventListener("close", onClose);
    // Prevent closing when clicking outside if loading
    dialog.value.addEventListener("click", (e) => {
      if (props.loading) {
        e.preventDefault();
      }
    });
  }
});

onUnmounted(() => {
  if (dialog.value) {
    dialog.value.removeEventListener("close", onClose);
  }
});
</script>

<template>
  <dialog ref="dialog" class="modal" :class="{ 'pointer-events-none': loading }">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold mb-4">
        {{ title }}
      </h3>

      <!-- Main content slot for form or any content -->
      <div class="py-4">
        <slot />
      </div>

      <!-- Actions slot for custom buttons or default buttons -->
      <div v-if="!hideActions" class="modal-action">
        <slot name="actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="loading"
            @click="onClose"
          >
            {{ cancelText || "Cancel" }}
          </button>
          <button
            type="button"
            class="btn"
            :class="confirmClass || 'btn-primary'"
            :disabled="loading"
            @click="onConfirm"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            {{ confirmText || "Confirm" }}
          </button>
        </slot>
      </div>
    </div>

    <!-- Backdrop -->
    <form method="dialog" class="modal-backdrop">
      <button type="button" :disabled="loading" @click="onClose">
        close
      </button>
    </form>
  </dialog>
</template>
