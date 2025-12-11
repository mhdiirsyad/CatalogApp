<template>
  <div class="flex flex-1 justify-center items-center">
    <div class="hero bg-base-300 container mx-auto max-h-96 rounded-lg">
      <div class="hero-content text-center h-96">
        <div class="max-w-md">
          <Icon name="tabler:mail-fast" size="64" />
          <h1 class="text-xl font-bold">
            Menunggu Aktivasi
          </h1>
          <p class="py-6">
            Terimakasih sudah melakukan pendaftaran. Tunggu admin melakukan review dan memberikan hasilnya melalui email. Mohon untuk cek email secara berkala.
          </p>
          <button class="btn btn-primary" @click="navigateTo('/')">
            <Icon name="tabler:arrow-left" size="24" /> Kembali
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
