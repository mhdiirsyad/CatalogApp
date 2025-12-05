<script setup lang="ts">
const props = defineProps<{
  title: string;
  message: string;
  buttonText?: string;
  isOpen: boolean;
  confimClass?: string;
}>();

const emits = defineEmits<{
  onClosed: [];
  onConfirmed: [];
}>();

function onClose() {
  emits("onClosed");
}

const dialog = useTemplateRef("dialog");

onMounted(() => {
  dialog.value?.addEventListener("close", onClose);
});

onUnmounted(() => {
  dialog.value?.removeEventListener("close", onClose);
});
</script>

<template>
  <!-- You can open the modal using ID.showModal() method -->
  <dialog ref="dialog" :open="isOpen" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        {{ props.title }}
      </h3>
      <p class="py-4">
        {{ props.message }}
      </p>
      <div class="modal-action">
        <form method="dialog" class="flex flex-row gap-2 justify-end">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn btn-secondary" @click="onClose">
            Cancel
          </button>
          <button class="btn" :class="props.confimClass" @click="emits('onConfirmed')">
            {{ props.buttonText || "OK" }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>
