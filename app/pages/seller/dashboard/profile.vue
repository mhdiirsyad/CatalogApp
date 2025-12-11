<script lang="ts" setup>
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const config = useRuntimeConfig();

// Fetch seller data
const sellerData = ref<any>(null);
const isEditProfileOpen = ref(false);
const isChangePasswordOpen = ref(false);

onMounted(async () => {
  sellerData.value = await authStore.fetchMe();
});

const fullAddress = computed(() => {
  if (!sellerData.value)
    return "";

  const { address, picRT, picRW, picVillage, picDistrict, picCity, picProvince } = sellerData.value;
  return `${address}, RT ${picRT}/RW ${picRW}, ${picVillage}, ${picDistrict}, ${picCity}, ${picProvince}`;
});

async function handleProfileUpdated() {
  // Refresh seller data
  sellerData.value = await authStore.fetchMe();
}

function openEditProfile() {
  isEditProfileOpen.value = true;
}

function closeEditProfile() {
  isEditProfileOpen.value = false;
}

function openChangePassword() {
  isChangePasswordOpen.value = true;
}

function closeChangePassword() {
  isChangePasswordOpen.value = false;
}
</script>

<template>
  <div class="container max-w-[1000px] mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        Profile Toko
      </h1>
      <p class="text-base-content/60">
        Informasi lengkap toko dan penanggung jawab
      </p>
    </div>

    <div v-if="!sellerData" class="flex justify-center items-center min-h-[400px]">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- Profile Card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Profile Photo -->
            <div class="flex flex-col items-center gap-4">
              <div class="avatar">
                <div class="w-48 h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    v-if="sellerData.picUrlPhoto"
                    :src="`${config.public.s3PublicUrl}/${sellerData.picUrlPhoto}`"
                    :alt="sellerData.storeName"
                    class="object-cover"
                  >
                  <div v-else class="bg-neutral text-neutral-content w-full h-full flex items-center justify-center">
                    <Icon name="tabler:user" size="96" />
                  </div>
                </div>
              </div>
              <div
                class="badge badge-lg"
                :class="{
                  'badge-success': sellerData.status === 'APPROVED',
                  'badge-warning': sellerData.status === 'PENDING',
                  'badge-error': sellerData.status === 'CANCELLED',
                }"
              >
                <Icon
                  :name="sellerData.status === 'APPROVED' ? 'tabler:circle-check' : sellerData.status === 'PENDING' ? 'tabler:clock' : 'tabler:circle-x'"
                  size="16"
                  class="mr-1"
                />
                {{ sellerData.status === 'APPROVED' ? 'Verified' : sellerData.status === 'PENDING' ? 'Pending' : 'Cancelled' }}
              </div>
            </div>

            <!-- Store Info -->
            <div class="flex-1 space-y-4">
              <div>
                <h2 class="text-3xl font-bold text-primary mb-2">
                  {{ sellerData.storeName }}
                </h2>
                <p class="text-base-content/70 leading-relaxed">
                  {{ sellerData.description }}
                </p>
              </div>

              <div class="divider" />

              <!-- Quick Info Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="tabler:calendar" size="20" class="text-primary" />
                  </div>
                  <div>
                    <p class="text-xs text-base-content/60">
                      Bergabung sejak
                    </p>
                    <p class="font-semibold">
                      {{ new Date(sellerData.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                    </p>
                  </div>
                </div>

                <div v-if="sellerData.verifiedAt" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Icon name="tabler:shield-check" size="20" class="text-success" />
                  </div>
                  <div>
                    <p class="text-xs text-base-content/60">
                      Terverifikasi
                    </p>
                    <p class="font-semibold">
                      {{ new Date(sellerData.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:user-circle" size="24" class="text-info" />
            Informasi Penanggung Jawab (PIC)
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:user" size="18" />
                  Nama Lengkap
                </span>
              </label>
              <div class="input input-bordered flex items-center gap-2 bg-base-100">
                <span>{{ sellerData.picName }}</span>
              </div>
            </div>

            <!-- Email -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:mail" size="18" />
                  Email
                </span>
              </label>
              <div class="input input-bordered flex items-center gap-2 bg-base-100">
                <a :href="`mailto:${sellerData.picEmail}`" class="link link-primary">
                  {{ sellerData.picEmail }}
                </a>
              </div>
            </div>

            <!-- Phone -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:phone" size="18" />
                  Nomor HP
                </span>
              </label>
              <div class="input input-bordered flex items-center gap-2 bg-base-100">
                <a :href="`tel:${sellerData.picHp}`" class="link link-primary">
                  {{ sellerData.picHp }}
                </a>
              </div>
            </div>

            <!-- KTP Number -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:id" size="18" />
                  No. KTP
                </span>
              </label>
              <div class="input input-bordered flex items-center gap-2 bg-base-100">
                <span>{{ sellerData.picNoKTP }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:map-pin" size="24" class="text-error" />
            Alamat Lengkap
          </h2>

          <div class="space-y-4">
            <!-- Full Address -->
            <div class="alert alert-info">
              <Icon name="tabler:location" size="20" />
              <span class="text-sm">{{ fullAddress }}</span>
            </div>

            <!-- Address Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Province -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">Provinsi</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picProvince }}
                </div>
              </div>

              <!-- City -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">Kota/Kabupaten</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picCity }}
                </div>
              </div>

              <!-- District -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">Kecamatan</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picDistrict }}
                </div>
              </div>

              <!-- Village -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">Kelurahan/Desa</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picVillage }}
                </div>
              </div>

              <!-- RT -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">RT</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picRT }}
                </div>
              </div>

              <!-- RW -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold text-xs">RW</span>
                </label>
                <div class="input input-sm input-bordered bg-base-100">
                  {{ sellerData.picRW }}
                </div>
              </div>
            </div>

            <!-- Street Address -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold flex items-center gap-2">
                  <Icon name="tabler:home" size="18" />
                  Alamat Jalan
                </span>
              </label>
              <div class="textarea textarea-bordered bg-base-100 min-h-20 flex items-center">
                {{ sellerData.address }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:file-certificate" size="24" class="text-warning" />
            Dokumen Verifikasi
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- KTP Photo -->
            <div>
              <label class="label">
                <span class="label-text font-semibold">Foto KTP</span>
              </label>
              <a
                :href="`${config.public.s3PublicUrl}/${sellerData.picUrlKTP}`"
                target="_blank"
                class="block group relative overflow-hidden rounded-lg border-2 border-base-300 hover:border-primary transition-all"
              >
                <img
                  :src="`${config.public.s3PublicUrl}/${sellerData.picUrlKTP}`"
                  alt="KTP Photo"
                  class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                >
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Icon name="tabler:zoom-in" size="32" class="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </div>

            <!-- Profile Photo -->
            <div>
              <label class="label">
                <span class="label-text font-semibold">Foto Profile</span>
              </label>
              <a
                :href="`${config.public.s3PublicUrl}/${sellerData.picUrlPhoto}`"
                target="_blank"
                class="block group relative overflow-hidden rounded-lg border-2 border-base-300 hover:border-primary transition-all"
              >
                <img
                  :src="`${config.public.s3PublicUrl}/${sellerData.picUrlPhoto}`"
                  alt="Profile Photo"
                  class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                >
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Icon name="tabler:zoom-in" size="32" class="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary" @click="openEditProfile">
              <Icon name="tabler:edit" size="20" />
              Edit Profile
            </button>
            <button class="btn btn-outline btn-error" @click="openChangePassword">
              <Icon name="tabler:lock" size="20" />
              Ubah Password
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SellerEditProfileModal
      :is-open="isEditProfileOpen"
      :seller-data="sellerData"
      @close="closeEditProfile"
      @updated="handleProfileUpdated"
    />
    <SellerChangePasswordModal
      :is-open="isChangePasswordOpen"
      @close="closeChangePassword"
      @updated="closeChangePassword"
    />
  </div>
</template>
