<script setup lang="ts">
import type { SelectSeller } from "~/lib/db/schema";

const route = useRoute();
const { $csrfFetch } = useNuxtApp();

const { data: seller, refresh } = await useFetch<Omit<SelectSeller, "password">>(`/api/admin/seller/${route.params.id}`, {
  lazy: true,
});

const config = useRuntimeConfig();

// Status Dialog
const isStatusDialogOpen = ref(false);
const dialogAction = ref<"approve" | "reject">("approve");
const isProcessing = ref(false);

// Toast notification
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

function openApproveDialog() {
  dialogAction.value = "approve";
  isStatusDialogOpen.value = true;
}

function openRejectDialog() {
  dialogAction.value = "reject";
  isStatusDialogOpen.value = true;
}

async function handleStatusChange() {
  if (!seller.value)
    return;

  try {
    isProcessing.value = true;
    const status = dialogAction.value === "approve" ? "APPROVED" : "CANCELLED";
    const actionText = dialogAction.value === "approve" ? "approved" : "rejected";

    await $csrfFetch(`/api/admin/seller/${seller.value.id}/status`, {
      method: "PUT",
      body: { status },
    });

    isStatusDialogOpen.value = false;
    await refresh();

    // Show success toast
    toastType.value = "success";
    toastMessage.value = `Seller registration has been ${actionText}. Email notification sent to ${seller.value.picEmail}`;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  }
  catch (error) {
    console.error("Failed to update seller status:", error);
    toastType.value = "error";
    toastMessage.value = "Failed to update seller status. Please try again.";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  }
  finally {
    isProcessing.value = false;
  }
}

const statusBadgeClass = computed(() => {
  if (!seller.value)
    return "";
  switch (seller.value.status) {
    case "APPROVED":
      return "badge-success";
    case "CANCELLED":
      return "badge-error";
    default:
      return "badge-warning";
  }
});

const canChangeStatus = computed(() => {
  return seller.value?.status === "PENDING";
});

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>

<template>
  <div class="container max-w-[1000px] mx-auto mt-8">
    <div class="flex items-center gap-4 mb-6">
      <button class="btn btn-ghost btn-sm" @click="$router.back()">
        <Icon name="tabler:arrow-left" size="20" />
        Back
      </button>
      <h1 class="text-2xl font-bold">
        Seller Details
      </h1>
    </div>

    <div v-if="seller" class="space-y-6">
      <!-- Status Badge -->
      <div class="card bg-base-200">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="card-title">
                Registration Status
              </h2>
              <p class="text-sm text-base-content/60">
                Submitted on {{ formatDate(seller.createdAt) }}
              </p>
            </div>
            <span class="badge badge-lg" :class="statusBadgeClass">
              {{ seller.status }}
            </span>
          </div>

          <div v-if="canChangeStatus" class="card-actions justify-end mt-4">
            <button
              class="btn btn-success"
              :disabled="isProcessing"
              @click="openApproveDialog"
            >
              <Icon name="tabler:check" size="20" />
              Approve
            </button>
            <button
              class="btn btn-error"
              :disabled="isProcessing"
              @click="openRejectDialog"
            >
              <Icon name="tabler:x" size="20" />
              Reject
            </button>
          </div>
          <div v-else-if="seller.status === 'APPROVED'" class="text-sm text-success mt-2">
            <Icon name="tabler:circle-check" size="16" class="inline" />
            Verified on {{ seller.verifiedAt ? formatDate(seller.verifiedAt) : '-' }}
          </div>
          <div v-else-if="seller.status === 'CANCELLED'" class="text-sm text-error mt-2">
            <Icon name="tabler:circle-x" size="16" class="inline" />
            Cancelled on {{ seller.verifiedAt ? formatDate(seller.verifiedAt) : '-' }}
          </div>
        </div>
      </div>

      <!-- Store Information -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:building-store" size="24" />
            Store Information
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-semibold">Store Name</span>
              </label>
              <p class="text-base-content">
                {{ seller.storeName }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label class="label">
                <span class="label-text font-semibold">Description</span>
              </label>
              <p class="text-base-content">
                {{ seller.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- PIC Information -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:user" size="24" />
            Person In Charge (PIC)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-semibold">Full Name</span>
              </label>
              <p class="text-base-content">
                {{ seller.picName }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">Email</span>
              </label>
              <p class="text-base-content">
                {{ seller.picEmail }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">Phone Number</span>
              </label>
              <p class="text-base-content">
                {{ seller.picHp }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">KTP Number</span>
              </label>
              <p class="text-base-content font-mono">
                {{ seller.picNoKTP }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:map-pin" size="24" />
            Address
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="label">
                <span class="label-text font-semibold">Street Address</span>
              </label>
              <p class="text-base-content">
                {{ seller.address }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">RT / RW</span>
              </label>
              <p class="text-base-content">
                {{ seller.picRT }} / {{ seller.picRW }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">Village</span>
              </label>
              <p class="text-base-content">
                {{ seller.picVillage }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">District</span>
              </label>
              <p class="text-base-content">
                {{ seller.picDistrict }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">City</span>
              </label>
              <p class="text-base-content">
                {{ seller.picCity }}
              </p>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">Province</span>
              </label>
              <p class="text-base-content">
                {{ seller.picProvince }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:file" size="24" />
            Documents
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-semibold">KTP Photo</span>
              </label>
              <a
                :href="`${config.public.s3PublicUrl}/${seller.picUrlKTP}`"
                target="_blank"
                class="block"
              >
                <img
                  :src="`${config.public.s3PublicUrl}/${seller.picUrlKTP}`"
                  alt="KTP Photo"
                  class="w-full h-48 object-cover rounded-lg border border-base-content/20 hover:opacity-80 transition-opacity cursor-pointer"
                >
              </a>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">Profile Photo</span>
              </label>
              <a
                :href="`${config.public.s3PublicUrl}/${seller.picUrlPhoto}`"
                target="_blank"
                class="block"
              >
                <img
                  :src="`${config.public.s3PublicUrl}/${seller.picUrlPhoto}`"
                  alt="Profile Photo"
                  class="w-full h-48 object-cover rounded-lg border border-base-content/20 hover:opacity-80 transition-opacity cursor-pointer"
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Status Change Confirmation Dialog -->
    <AdminSellerStatusDialog
      :is-open="isStatusDialogOpen"
      :action="dialogAction"
      :seller-name="seller?.storeName"
      @close="isStatusDialogOpen = false"
      @confirm="handleStatusChange"
    />

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast toast-top toast-end z-50">
      <div
        class="alert"
        :class="{
          'alert-success': toastType === 'success',
          'alert-error': toastType === 'error',
        }"
      >
        <Icon
          :name="toastType === 'success' ? 'tabler:circle-check' : 'tabler:circle-x'"
          size="20"
        />
        <span>{{ toastMessage }}</span>
        <button class="btn btn-sm btn-ghost" @click="showToast = false">
          <Icon name="tabler:x" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
