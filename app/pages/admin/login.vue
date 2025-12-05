<script setup lang="ts">
import type { FetchError } from "ofetch";

import useAdminStore from "~/stores/admin";

const userStore = useAdminStore();

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(AdminLoginSchema),
});

const submitError = ref("");
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();
const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  submitError.value = "";
  try {
    await $csrfFetch("/api/admin/login", {
      method: "post",
      body: values,
    });

    const { fetch } = useUserSession();
    await fetch();

    await userStore.refreshUser();
    await navigateTo("/admin/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    submitError.value = error?.statusMessage || error?.data?.message || "Login failed";
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container max-w-md mx-auto">
    <div>
      <h1 class="text-xl font-bold text-center my-4">
        Masuk Admin
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
        name="username"
        label="Username"
        type="text"
        placeholder="username"
        :error="errors.username"
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
      <div class="flex justify-center">
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="!loading">Masuk</span>
          <span v-else>Memproses...</span>
        </button>
      </div>
    </form>
  </div>
</template>
