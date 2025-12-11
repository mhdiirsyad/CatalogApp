<script lang="ts" setup>
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Form data
const formData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Validation errors
const errors = ref<Record<string, string>>({});

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

function validateForm() {
  errors.value = {};
  let isValid = true;

  if (!formData.value.currentPassword) {
    errors.value.currentPassword = "Password saat ini wajib diisi";
    isValid = false;
  }

  if (!formData.value.newPassword) {
    errors.value.newPassword = "Password baru wajib diisi";
    isValid = false;
  }
  else if (formData.value.newPassword.length < 8) {
    errors.value.newPassword = "Password minimal 8 karakter";
    isValid = false;
  }
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/.test(formData.value.newPassword)) {
    errors.value.newPassword = "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial";
    isValid = false;
  }

  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = "Konfirmasi password wajib diisi";
    isValid = false;
  }
  else if (formData.value.newPassword !== formData.value.confirmPassword) {
    errors.value.confirmPassword = "Password tidak cocok";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { error } = await useFetch("/api/seller/password", {
      method: "PUT",
      body: {
        currentPassword: formData.value.currentPassword,
        newPassword: formData.value.newPassword,
        confirmPassword: formData.value.confirmPassword,
      },
    });

    if (error.value) {
      errorMessage.value = error.value.data?.message || "Gagal mengubah password";
      return;
    }

    successMessage.value = "Password berhasil diubah!";

    // Reset form
    formData.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Close modal after 1.5 seconds
    setTimeout(() => {
      emit("updated");
      emit("close");
      successMessage.value = "";
    }, 1500);
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
    successMessage.value = "";
    formData.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    emit("close");
  }
}

// Password strength indicator
const passwordStrength = computed(() => {
  const password = formData.value.newPassword;
  if (!password)
    return { level: 0, text: "", class: "" };

  let strength = 0;
  if (password.length >= 8)
    strength++;
  if (/[a-z]/.test(password))
    strength++;
  if (/[A-Z]/.test(password))
    strength++;
  if (/\d/.test(password))
    strength++;
  if (/\W/.test(password))
    strength++;

  if (strength <= 2)
    return { level: strength, text: "Lemah", class: "text-error" };
  if (strength <= 3)
    return { level: strength, text: "Sedang", class: "text-warning" };
  if (strength <= 4)
    return { level: strength, text: "Kuat", class: "text-info" };
  return { level: strength, text: "Sangat Kuat", class: "text-success" };
});
</script>

<template>
  <dialog :open="isOpen" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg mb-4">
        <Icon name="tabler:lock" size="20" class="inline" />
        Ubah Password
      </h3>

      <!-- Success Alert -->
      <div v-if="successMessage" class="alert alert-success mb-4">
        <Icon name="tabler:check" size="20" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <Icon name="tabler:alert-circle" size="20" />
        <span>{{ errorMessage }}</span>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Current Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password Saat Ini <span class="text-error">*</span></span>
          </label>
          <div class="relative">
            <input
              v-model="formData.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.currentPassword }"
              :disabled="isLoading"
              autocomplete="current-password"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              :disabled="isLoading"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <Icon
                :name="showCurrentPassword ? 'tabler:eye-off' : 'tabler:eye'"
                size="20"
                class="text-base-content/50"
              />
            </button>
          </div>
          <label v-if="errors.currentPassword" class="label">
            <span class="label-text-alt text-error">{{ errors.currentPassword }}</span>
          </label>
        </div>

        <!-- New Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password Baru <span class="text-error">*</span></span>
          </label>
          <div class="relative">
            <input
              v-model="formData.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.newPassword }"
              :disabled="isLoading"
              autocomplete="new-password"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              :disabled="isLoading"
              @click="showNewPassword = !showNewPassword"
            >
              <Icon
                :name="showNewPassword ? 'tabler:eye-off' : 'tabler:eye'"
                size="20"
                class="text-base-content/50"
              />
            </button>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="formData.newPassword" class="mt-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all"
                  :class="{
                    'bg-error': passwordStrength.level <= 2,
                    'bg-warning': passwordStrength.level === 3,
                    'bg-info': passwordStrength.level === 4,
                    'bg-success': passwordStrength.level === 5,
                  }"
                  :style="{ width: `${(passwordStrength.level / 5) * 100}%` }"
                />
              </div>
              <span class="text-xs font-medium" :class="passwordStrength.class">
                {{ passwordStrength.text }}
              </span>
            </div>
          </div>

          <label v-if="errors.newPassword" class="label">
            <span class="label-text-alt text-error">{{ errors.newPassword }}</span>
          </label>
          <label v-else class="label">
            <span class="label-text-alt text-base-content/60">
              Min. 8 karakter, kombinasi huruf besar, kecil, angka & simbol
            </span>
          </label>
        </div>

        <!-- Confirm Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Konfirmasi Password Baru <span class="text-error">*</span></span>
          </label>
          <div class="relative">
            <input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.confirmPassword }"
              :disabled="isLoading"
              autocomplete="new-password"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              :disabled="isLoading"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'tabler:eye-off' : 'tabler:eye'"
                size="20"
                class="text-base-content/50"
              />
            </button>
          </div>
          <label v-if="errors.confirmPassword" class="label">
            <span class="label-text-alt text-error">{{ errors.confirmPassword }}</span>
          </label>
        </div>

        <!-- Info Alert -->
        <div class="alert alert-info">
          <Icon name="tabler:info-circle" size="20" />
          <div class="text-sm">
            <p class="font-semibold">
              Tips keamanan:
            </p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>Jangan gunakan password yang mudah ditebak</li>
              <li>Gunakan kombinasi karakter yang berbeda</li>
              <li>Jangan bagikan password Anda</li>
            </ul>
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
            Ubah Password
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
