<script lang="ts" setup>
const props = defineProps<{
  isOpen: boolean;
  sellerData: any;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const isLoading = ref(false);
const errorMessage = ref("");

// Form data
const formData = ref({
  storeName: "",
  description: "",
  picName: "",
  picHp: "",
  address: "",
  picRT: 0,
  picRW: 0,
  picProvince: "",
  picCity: "",
  picDistrict: "",
  picVillage: "",
});

// Initialize form data when sellerData changes
watch(
  () => props.sellerData,
  (data) => {
    if (data) {
      formData.value = {
        storeName: data.storeName || "",
        description: data.description || "",
        picName: data.picName || "",
        picHp: data.picHp || "",
        address: data.address || "",
        picRT: data.picRT || 0,
        picRW: data.picRW || 0,
        picProvince: data.picProvince || "",
        picCity: data.picCity || "",
        picDistrict: data.picDistrict || "",
        picVillage: data.picVillage || "",
      };
    }
  },
  { immediate: true },
);

// Validation errors
const errors = ref<Record<string, string>>({});

function validateForm() {
  errors.value = {};
  let isValid = true;

  if (!formData.value.storeName.trim()) {
    errors.value.storeName = "Nama toko wajib diisi";
    isValid = false;
  }

  if (!formData.value.description.trim()) {
    errors.value.description = "Deskripsi toko wajib diisi";
    isValid = false;
  }

  if (!formData.value.picName.trim()) {
    errors.value.picName = "Nama PIC wajib diisi";
    isValid = false;
  }

  if (!formData.value.picHp.trim()) {
    errors.value.picHp = "Nomor HP wajib diisi";
    isValid = false;
  }
  else if (!/^\+?\d{11,15}$/.test(formData.value.picHp)) {
    errors.value.picHp = "Nomor HP tidak valid (11-15 digit)";
    isValid = false;
  }

  if (!formData.value.address.trim()) {
    errors.value.address = "Alamat wajib diisi";
    isValid = false;
  }

  if (formData.value.picRT < 1) {
    errors.value.picRT = "RT wajib diisi";
    isValid = false;
  }

  if (formData.value.picRW < 1) {
    errors.value.picRW = "RW wajib diisi";
    isValid = false;
  }

  return isValid;
}

const { $csrfFetch } = useNuxtApp();

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { error } = await $csrfFetch("/api/seller/profile", {
      method: "PUT",
      body: formData.value,
    });

    if (error.value) {
      errorMessage.value = error.value.data?.message || "Gagal mengupdate profile";
      return;
    }

    emit("updated");
    emit("close");
  }
  catch (err: any) {
    errorMessage.value = err.message || "Terjadi kesalahan";
  }
  finally {
    isLoading.value = false;
  }
}

function handleClose() {
  if (!isLoading.value) {
    errors.value = {};
    errorMessage.value = "";
    emit("close");
  }
}
</script>

<template>
  <dialog :open="isOpen" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-3xl">
      <h3 class="font-bold text-lg mb-4">
        <Icon name="tabler:edit" size="20" class="inline" />
        Edit Profile
      </h3>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <Icon name="tabler:alert-circle" size="20" />
        <span>{{ errorMessage }}</span>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Store Info -->
        <div class="border-b pb-4">
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <Icon name="tabler:building-store" size="18" />
            Informasi Toko
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control flex flex-col">
              <label class="label">
                <span class="label-text">Nama Toko <span class="text-error">*</span></span>
              </label>
              <input
                v-model="formData.storeName"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.storeName }"
                :disabled="isLoading"
              >
              <label v-if="errors.storeName" class="label">
                <span class="label-text-alt text-error">{{ errors.storeName }}</span>
              </label>
            </div>

            <div class="form-control flex flex-col">
              <label class="label">
                <span class="label-text">Deskripsi Toko <span class="text-error">*</span></span>
              </label>
              <textarea
                v-model="formData.description"
                class="textarea textarea-bordered"
                :class="{ 'textarea-error': errors.description }"
                rows="3"
                :disabled="isLoading"
              />
              <label v-if="errors.description" class="label">
                <span class="label-text-alt text-error">{{ errors.description }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- PIC Info -->
        <div class="border-b pb-4">
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <Icon name="tabler:user-circle" size="18" />
            Informasi PIC
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Nama Lengkap <span class="text-error">*</span></span>
              </label>
              <input
                v-model="formData.picName"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.picName }"
                :disabled="isLoading"
              >
              <label v-if="errors.picName" class="label">
                <span class="label-text-alt text-error">{{ errors.picName }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Nomor HP <span class="text-error">*</span></span>
              </label>
              <input
                v-model="formData.picHp"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.picHp }"
                placeholder="08123456789"
                :disabled="isLoading"
              >
              <label v-if="errors.picHp" class="label">
                <span class="label-text-alt text-error">{{ errors.picHp }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Address Info -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <Icon name="tabler:map-pin" size="18" />
            Alamat
          </h4>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Provinsi <span class="text-error">*</span></span>
                </label>
                <input
                  v-model="formData.picProvince"
                  type="text"
                  class="input input-bordered"
                  :disabled="isLoading"
                >
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Kota/Kabupaten <span class="text-error">*</span></span>
                </label>
                <input
                  v-model="formData.picCity"
                  type="text"
                  class="input input-bordered"
                  :disabled="isLoading"
                >
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Kecamatan <span class="text-error">*</span></span>
                </label>
                <input
                  v-model="formData.picDistrict"
                  type="text"
                  class="input input-bordered"
                  :disabled="isLoading"
                >
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Kelurahan/Desa <span class="text-error">*</span></span>
                </label>
                <input
                  v-model="formData.picVillage"
                  type="text"
                  class="input input-bordered"
                  :disabled="isLoading"
                >
              </div>

              <div class="form-control flex flex-col">
                <label class="label">
                  <span class="label-text">RT <span class="text-error">* </span></span>
                </label>
                <input
                  v-model.number="formData.picRT"
                  type="number"
                  class="input input-bordered"
                  :class="{ 'input-error': errors.picRT }"
                  min="1"
                  :disabled="isLoading"
                >
                <label v-if="errors.picRT" class="label">
                  <span class="label-text-alt text-error">{{ errors.picRT }}</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">RW <span class="text-error">*</span></span>
                </label>
                <input
                  v-model.number="formData.picRW"
                  type="number"
                  class="input input-bordered"
                  :class="{ 'input-error': errors.picRW }"
                  min="1"
                  :disabled="isLoading"
                >
                <label v-if="errors.picRW" class="label">
                  <span class="label-text-alt text-error">{{ errors.picRW }}</span>
                </label>
              </div>
            </div>

            <div class="form-control flex flex-col">
              <label class="label">
                <span class="label-text">Alamat Jalan <span class="text-error">*</span></span>
              </label>
              <textarea
                v-model="formData.address"
                class="textarea textarea-bordered w-full"
                :class="{ 'textarea-error': errors.address }"
                rows="2"
                placeholder="Jl. Contoh No. 123"
                :disabled="isLoading"
              />
              <label v-if="errors.address" class="label">
                <span class="label-text-alt text-error">{{ errors.address }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="isLoading"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading loading-spinner" />
            <Icon v-else name="tabler:check" size="20" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
