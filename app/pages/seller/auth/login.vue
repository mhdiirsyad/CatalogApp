<script setup lang="ts">
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import useAuthStore from "../../../stores/auth";

definePageMeta({ middleware: "guest" });

const loginSchema = z.object({
  identifier: z.string().min(1, "Email / No. HP is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

const { handleSubmit, errors, setErrors } = useForm<LoginInput>({
  validationSchema: toTypedSchema(loginSchema),
});

const submitError = ref("");
const loading = ref(false);
const authStore = useAuthStore();
const { fetch: refreshSession } = useUserSession();

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  submitError.value = "";
  try {
    const result = await authStore.login(values);
    // Refresh session untuk update useUserSession
    await refreshSession();
    // redirect to target (if provided) or seller dashboard after successful login
    const route = useRoute();
    const redirect = (route.query.redirect as string) || "/seller/dashboard";
    await navigateTo(redirect);
    return result;
  }
  catch (e) {
    const error = e as FetchError;
    if (error?.data?.data) {
      setErrors(error.data.data as Record<string, string>);
    }
    submitError.value = error?.statusMessage || error?.data?.message || "Login failed";
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container max-w-md m-auto bg-base-200 shadow-lg p-6 rounded-lg">
    <div>
      <h1 class="text-xl font-bold text-center my-4">
        Masuk Seller
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
        name="identifier"
        label="Email atau No. HP"
        type="text"
        placeholder="email atau nohp"
        :error="errors.identifier"
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

      <div class="text-center my-4">
        <p class="text-sm">
          Belum memiliki akun? <NuxtLink to="/seller/auth/register" class="text-primary font-semibold">
            Daftar
          </NuxtLink>
        </p>
      </div>

      <div class="flex justify-center">
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="!loading">Masuk</span>
          <span v-else class="loading loading-dots loading-lg" />
        </button>
      </div>
    </form>
  </div>
</template>
