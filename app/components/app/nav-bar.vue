<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink to="/" class="btn btn-ghost text-xl">
        Catalog App
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <AppThemeToggle />
      <button class="btn btn-neutral" @click="navigateTo('/seller/auth/register')">
        Daftar Seller
      </button>
    </div>
  </div>
</template>
