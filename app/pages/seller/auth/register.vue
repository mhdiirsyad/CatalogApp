<script setup lang="ts">
import type { FetchError } from "ofetch";
import type { ZodSchema } from "zod";

import { toTypedSchema } from "@vee-validate/zod";

import type { InputSeller } from "~/lib/db/schema";

import { InsertSeller } from "~/lib/db/schema";

definePageMeta({ middleware: "guest" });

const { handleSubmit, errors, setErrors } = useForm({
  validationSchema: toTypedSchema(InsertSeller as unknown as ZodSchema<InputSeller>),
});

const submitError = ref("");
const loading = ref(false);

const onSubmit = handleSubmit(async (values) => {
  try {
    submitError.value = "";
    const result = await $fetch("/api/seller", {
      method: "post",
      body: values,
    });
    console.log("result", result);
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data.data);
    }
    submitError.value = error.statusMessage || "An error occurred during registration.";
  }
});
</script>

<template>
  <div class="container max-w-md mx-auto">
    <div>
      <h1 class="text-xl font-bold text-center my-4">
        Daftar Seller
      </h1>
    </div>
    <div v-if="submitError" role="alert" class="alert alert-error">
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
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
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
      <AppFormField
        name="address"
        label="Alamat"
        placeholder="Alamat lengkap"
        :error="errors.address"
        :disabled="loading"
      />
      <AppFormSelect
        name="picProvince"
        label="Provinsi"
        placeholder="Pilih Provinsi"
        :error="errors.picProvince"
        :options="['jawa barat', 'jatim', 'bali']"
        :disabled="loading"
      />
      <AppFormSelect
        name="picCity"
        label="Kota"
        placeholder="Pilih Kota"
        :error="errors.picCity"
        :options="['jawa barat', 'jatim', 'bali']"
        :disabled="loading"
      />
      <AppFormSelect
        name="picDistrict"
        label="Kecamatan"
        placeholder="Pilih Kecamatan"
        :error="errors.picDistrict"
        :options="['kecamatan1', 'kecamatan2', 'kecamatan3']"
        :disabled="loading"
      />
      <AppFormSelect
        name="picVillage"
        label="Desa/Kelurahan"
        placeholder="Pilih Desa/Kelurahan"
        :error="errors.picVillage"
        :options="['desa1', 'desa2', 'desa3']"
        :disabled="loading"
      />
      <div class="flex justify-between gap-2">
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
      <AppFormField
        name="picNoKTP"
        label="Nomor KTP"
        placeholder="Nomor KTP"
        :error="errors.picNoKTP"
        :disabled="loading"
      />
      <AppFormField
        name="picUrlKTP"
        label="Foto Ktp KTP"
        placeholder="Nomor KTP"
        :error="errors.picUrlKTP"
        :disabled="loading"
      />
      <AppFormField
        name="picUrlPhoto"
        label="Foto Profil"
        placeholder="Foto Profil"
        :error="errors.picUrlPhoto"
        :disabled="loading"
      />

      <div class="flex justify-center">
        <button type="submit" class="btn btn-primary w-full">
          Daftar
        </button>
      </div>
    </form>
  </div>
</template>
