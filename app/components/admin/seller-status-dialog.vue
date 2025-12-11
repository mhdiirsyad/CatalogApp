<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  action: "approve" | "reject";
  sellerName?: string;
  loading?: boolean;
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

const actionText = computed(() => props.action === "approve" ? "Approve" : "Reject");
const actionClass = computed(() => props.action === "approve" ? "btn-success" : "btn-error");
</script>

<template>
  <dialog ref="dialogRef" class="modal" @close="emit('close')">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ actionText }} Seller Registration
      </h3>

      <div class="alert alert-warning mb-4">
        <Icon name="tabler:alert-triangle" size="20" />
        <span>This action cannot be undone!</span>
      </div>

      <p class="mb-4">
        Are you sure you want to <strong class="lowercase">{{ actionText }}</strong>
        seller registration for <strong>{{ sellerName }}</strong>?
      </p>

      <div v-if="action === 'approve'" class="space-y-3 mb-4">
        <div class="alert alert-info">
          <Icon name="tabler:info-circle" size="20" />
          <span>The seller will be able to log in and manage their products.</span>
        </div>
        <div class="alert alert-success">
          <Icon name="tabler:mail-check" size="20" />
          <span>An approval email notification will be sent to the seller.</span>
        </div>
      </div>

      <div v-else class="space-y-3 mb-4">
        <div class="alert alert-error">
          <Icon name="tabler:ban" size="20" />
          <span>The seller registration will be cancelled and they cannot log in.</span>
        </div>
        <div class="alert alert-warning">
          <Icon name="tabler:mail-x" size="20" />
          <span>A rejection email notification will be sent to the seller.</span>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn" :disabled="props.loading" @click="emit('close')">
          Batal
        </button>
        <button
          class="btn"
          :disabled="props.loading"
          :class="actionClass"
          @click="emit('confirm')"
        >
          <span v-if="!props.loading">{{ actionText }}</span>
          <span v-else class="loading loading-spinner loading-sm" />
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
