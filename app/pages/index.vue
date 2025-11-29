<template>
  <div class="hero bg-base-300 container mx-auto rounded-lg mt-10">
    <div class="hero-content text-center min-h-96">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          Catalog App
        </h1>
        <p class="py-6">
          Aplikasi katalog produk sederhana untuk para seller memamerkan produk
          mereka kepada calon pembeli.
        </p>
        <button class="btn btn-primary" @click="navigateTo('/seller/auth/register')">
          Daftar seller <Icon name="tabler:arrow-right" size="24" />
        </button>
      </div>
    </div>
  </div>
</template>
