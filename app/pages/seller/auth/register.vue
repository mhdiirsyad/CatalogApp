<script setup lang="ts">
import type { FetchError } from "ofetch";
import type { ZodSchema } from "zod";

import { toTypedSchema } from "@vee-validate/zod";

import type { InputSellerForm } from "~/lib/db/schema";

import { InsertSellerForm } from "~/lib/db/schema";

definePageMeta({ middleware: "guest" });

const { handleSubmit, errors, setErrors, setFieldValue, validate, values } = useForm({
  validationSchema: toTypedSchema(InsertSellerForm as unknown as ZodSchema<InputSellerForm>),
});

const submitError = ref("");
const loading = ref(false);

// Stepper state
const currentStep = ref(1);
const totalSteps = 3;

// Define fields for each step
const step1Fields = ["storeName", "description", "picName", "picHp", "picEmail", "password"];
const step2Fields = ["address", "picProvince", "picCity", "picDistrict", "picVillage", "picRT", "picRW"];
const step3Fields = ["picNoKTP"];

async function validateCurrentStep(): Promise<boolean> {
  let fieldsToValidate: string[] = [];

  if (currentStep.value === 1) {
    fieldsToValidate = step1Fields;
  }
  else if (currentStep.value === 2) {
    fieldsToValidate = step2Fields;
  }
  else if (currentStep.value === 3) {
    fieldsToValidate = step3Fields;
  }

  // Trigger validation
  await validate();

  // Check if there are errors in current step fields
  const hasStepErrors = fieldsToValidate.some(field => (errors.value as any)[field]);

  // Check if required fields are empty
  const hasEmptyFields = fieldsToValidate.some((field) => {
    const value = (values as any)[field];
    return value === undefined || value === null || value === "";
  });

  return !hasStepErrors && !hasEmptyFields;
}

async function nextStep() {
  const isValid = await validateCurrentStep();

  if (!isValid) {
    submitError.value = "Mohon lengkapi semua field yang diperlukan";
    return;
  }

  submitError.value = "";
  if (currentStep.value < totalSteps) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevStep() {
  submitError.value = "";
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Region
const provinces = ref<Region[]>([]);
const regencies = ref<Region[]>([]);
const districts = ref<Region[]>([]);
const villages = ref<Region[]>([]);

const selectedProvince = ref<Region | null>(null);

const selectedRegency = ref<Region | null>(null);

const selectedDistrict = ref<Region | null>(null);

const selectedVillage = ref<Region | null>(null);

async function fetchProvinces() {
  const { data } = await useFetch<Region[]>("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
  provinces.value = data.value ?? [];
}

async function onProvinceChange(selected: any | null) {
  // Field value already set by AppRegionSelect component
  regencies.value = [];
  districts.value = [];
  villages.value = [];

  setFieldValue("picCity", "");
  setFieldValue("picDistrict", "");
  setFieldValue("picVillage", "");

  const id = selected?.id ?? "";
  if (!id)
    return;

  loading.value = true;
  const { data } = await useFetch<Region[]>(
    `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`,
  );
  regencies.value = data.value ?? [];
  loading.value = false;
}

async function onRegencyChange(selected: any | null) {
  // Field value already set by AppRegionSelect component
  districts.value = [];
  villages.value = [];

  setFieldValue("picDistrict", "");
  setFieldValue("picVillage", "");

  const id = selected?.id ?? "";
  if (!id)
    return;

  loading.value = true;
  const { data } = await useFetch<Region[]>(
    `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`,
  );
  districts.value = data.value ?? [];
  loading.value = false;
}
async function onDistrictChange(selected: any | null) {
  // Field value already set by AppRegionSelect component
  villages.value = [];

  setFieldValue("picVillage", "");

  const id = selected?.id ?? "";
  if (!id)
    return;

  loading.value = true;
  const { data } = await useFetch<Region[]>(
    `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`,
  );
  villages.value = data.value ?? [];
  loading.value = false;
}

function onVillageChange(_selected: any | null) {
  // Field value already set by AppRegionSelect component
}

// File upload refs
const ktpFileRef = ref<{
  uploadImages: () => Promise<string[]>;
  hasFiles: () => boolean;
} | null>(null);
const photoFileRef = ref<{
  uploadImages: () => Promise<string[]>;
  hasFiles: () => boolean;
} | null>(null);

const { $csrfFetch } = useNuxtApp();
const onSubmit = handleSubmit(async (values) => {
  console.warn("onSubmit called - form is valid!", values);
  try {
    submitError.value = "";
    loading.value = true;

    // Validate file uploads first
    console.warn("Checking file uploads...");
    console.warn("ktpFileRef.value:", ktpFileRef.value);
    console.warn("photoFileRef.value:", photoFileRef.value);

    const hasKtpFile = ktpFileRef.value?.hasFiles();
    const hasPhotoFile = photoFileRef.value?.hasFiles();

    console.warn("hasKtpFile:", hasKtpFile, "hasPhotoFile:", hasPhotoFile);

    if (!hasKtpFile) {
      submitError.value = "Foto KTP harus diupload";
      loading.value = false;
      return;
    }
    if (!hasPhotoFile) {
      submitError.value = "Foto Profil harus diupload";
      loading.value = false;
      return;
    }

    // Upload KTP image
    console.warn("Uploading KTP image...");
    const ktpKeys = ktpFileRef.value ? await ktpFileRef.value.uploadImages() : [];
    console.warn("KTP upload result:", ktpKeys);
    if (ktpKeys.length === 0) {
      submitError.value = "Foto KTP harus diupload";
      loading.value = false;
      return;
    }

    // Upload Photo image
    console.warn("Uploading Photo image...");
    const photoKeys = photoFileRef.value ? await photoFileRef.value.uploadImages() : [];
    console.warn("Photo upload result:", photoKeys);
    if (photoKeys.length === 0) {
      submitError.value = "Foto Profil harus diupload";
      loading.value = false;
      return;
    }

    console.warn("Sending registration request...");
    await $csrfFetch("/api/seller", {
      method: "post",
      body: {
        ...values,
        picUrlKTP: ktpKeys[0],
        picUrlPhoto: photoKeys[0],
      },
    });
    console.warn("Registration successful!");
    // Registration successful
    navigateTo("/seller/auth/waiting-activation");
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data.data);
    }
    submitError.value = error.statusMessage || "An error occurred during registration.";
  }
  finally {
    loading.value = false;
  }
}, (invalidResult) => {
  console.warn("Form validation failed!", invalidResult);
  console.warn("Validation errors:", errors.value);
  submitError.value = "Mohon periksa kembali data yang diisi";
});

onMounted(async () => {
  fetchProvinces();
});
</script>

<template>
  <div class="container max-w-2xl mx-auto p-6">
    <div class="bg-base-100 shadow-lg p-6 rounded-lg">
      <h1 class="text-2xl font-bold text-center mb-6">
        Daftar Seller
      </h1>

      <!-- Stepper -->
      <ul class="steps w-full mb-8">
        <li class="step" :class="{ 'step-primary': currentStep >= 1 }">
          Identitas & Toko
        </li>
        <li class="step" :class="{ 'step-primary': currentStep >= 2 }">
          Alamat
        </li>
        <li class="step" :class="{ 'step-primary': currentStep >= 3 }">
          Dokumen
        </li>
      </ul>

      <div v-if="submitError" role="alert" class="alert alert-error mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ submitError }}</span>
      </div>

      <form @submit="(e) => { console.warn('Form submit event triggered', e); onSubmit(e); }">
        <!-- Step 1: Identitas & Toko -->
        <div v-show="currentStep === 1" class="space-y-4">
          <h2 class="text-lg font-semibold mb-4">
            Identitas & Nama Toko
          </h2>
          <AppFormField
            name="storeName"
            label="Nama Toko"
            placeholder="Nama Toko"
            :error="errors.storeName"
            :disabled="loading"
          />
          <AppFormField
            name="description"
            label="Deskripsi"
            type="textarea"
            placeholder="Deskripsi singkat Toko"
            :error="errors.description"
            :disabled="loading"
          />
          <AppFormField
            name="picName"
            label="Nama PIC"
            placeholder="Nama PIC"
            :error="errors.picName"
            :disabled="loading"
          />
          <AppFormField
            name="picHp"
            label="No HP PIC"
            placeholder="No HP PIC"
            :error="errors.picHp"
            :disabled="loading"
          />
          <AppFormField
            name="picEmail"
            label="Email PIC"
            type="email"
            placeholder="email@email.com"
            :error="errors.picEmail"
            :disabled="loading"
          />
          <AppFormField
            name="password"
            label="Password"
            type="password"
            placeholder="Password"
            :error="errors.password"
            :disabled="loading"
          />
        </div>

        <!-- Step 2: Alamat -->
        <div v-show="currentStep === 2" class="space-y-4">
          <h2 class="text-lg font-semibold mb-4">
            Alamat Lengkap
          </h2>
          <AppFormField
            name="address"
            label="Alamat"
            placeholder="Alamat lengkap"
            :error="errors.address"
            :disabled="loading"
          />
          <AppRegionSelect
            v-model="selectedProvince"
            name="picProvince"
            label="Provinsi"
            placeholder="Pilih Provinsi"
            :error="errors.picProvince"
            :options="provinces"
            :disabled="loading"
            @change="onProvinceChange"
          />
          <AppRegionSelect
            v-model="selectedRegency"
            name="picCity"
            label="Kota"
            placeholder="Pilih Kota"
            :error="errors.picCity"
            :options="regencies"
            :disabled="loading || regencies.length === 0"
            @change="onRegencyChange"
          />
          <AppRegionSelect
            v-model="selectedDistrict"
            name="picDistrict"
            label="Kecamatan"
            placeholder="Pilih Kecamatan"
            :error="errors.picDistrict"
            :options="districts"
            :disabled="loading || districts.length === 0"
            @change="onDistrictChange"
          />
          <AppRegionSelect
            v-model="selectedVillage"
            name="picVillage"
            label="Desa/Kelurahan"
            placeholder="Pilih Desa/Kelurahan"
            :error="errors.picVillage"
            :options="villages"
            :disabled="loading || villages.length === 0"
            @change="onVillageChange"
          />
          <div class="grid grid-cols-2 gap-2">
            <AppFormField
              name="picRT"
              label="RT"
              type="number"
              placeholder="RT"
              :error="errors.picRT"
              :disabled="loading"
            />
            <AppFormField
              name="picRW"
              label="RW"
              type="number"
              placeholder="RW"
              :error="errors.picRW"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Step 3: Dokumen -->
        <div v-show="currentStep === 3" class="space-y-4">
          <h2 class="text-lg font-semibold mb-4">
            Dokumen Pendukung
          </h2>
          <AppFormField
            name="picNoKTP"
            label="Nomor KTP"
            placeholder="Nomor KTP"
            :error="errors.picNoKTP"
            :disabled="loading"
          />
          <AppFileField
            ref="ktpFileRef"
            label="Foto KTP"
            :multiple="false"
            :max-files="1"
            :public-upload="true"
          />
          <AppFileField
            ref="photoFileRef"
            label="Foto Profil"
            :multiple="false"
            :max-files="1"
            :public-upload="true"
          />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center mt-8">
          <button
            v-if="currentStep > 1"
            type="button"
            class="btn btn-secondary"
            :disabled="loading"
            @click="prevStep"
          >
            <Icon name="tabler:arrow-left" size="20" />
            Kembali
          </button>
          <div v-else />

          <button
            v-if="currentStep < totalSteps"
            type="button"
            class="btn btn-primary"
            :disabled="loading"
            @click="nextStep"
          >
            Selanjutnya
            <Icon name="tabler:arrow-right" size="20" />
          </button>
          <button
            v-else
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="!loading">Daftar</span>
            <span v-else class="loading loading-spinner loading-sm" />
          </button>
        </div>

        <div class="text-center mt-6">
          <p class="text-sm">
            Sudah memiliki akun? <NuxtLink to="/seller/auth/login" class="text-primary font-semibold">
              Masuk
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
