// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

import env from "./app/lib/env";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  app: {
    head: {
      title: "AmbatuShop",
    },
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vee-validate/nuxt",
    "nuxt-auth-utils",
    "nuxt-csurf",
  ],
  css: ["./app/assets/css/main.css"],
  eslint: {
    config: {
      standalone: false,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      watch: {
        ignored: ["./docker-data/*"],
      },
    },
  },
  colorMode: {
    dataValue: "theme",
  },
  runtimeConfig: {
    public: {
      s3PublicUrl: env.S3_PUBLIC_URL,
      appPublicUrl: env.APP_PUBLIC_URL,
      siteName: "AmbatuShop",
    },
  },
});
