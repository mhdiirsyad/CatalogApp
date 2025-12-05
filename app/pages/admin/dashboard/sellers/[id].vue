<script setup lang="ts">
const route = useRoute();
const { $csrfFetch } = useNuxtApp();

const { data: seller } = await useFetch(`/api/admin/seller/${route.params.id}`);
const { data: Province } = await useFetch(
  `https://www.emsifa.com/api-wilayah-indonesia/api/provinces/${seller.value?.picProvince}.json`,
  {
    lazy: true,
  },
);

async function handleUpdate(status: string) {
  try {
    await $csrfFetch(`/api/admin/seller/${route.params.id}`, {
      method: "put",
      body: {
        status,
      },
    });
    await navigateTo("/admin/dashboard/sellers");
  }
  catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div class="max-w-[1000px] mx-auto mt-8 rounded-lg shadow-md p-4">
    <h1 class="text-2xl font-bold mb-4">
      Seller Details - {{ seller?.storeName }}
    </h1>
    <p>{{ seller?.description }}</p>

    <div>
      <h1>Alamat</h1>
      <p>{{ seller?.address }}</p>
      <p>{{ seller?.picCity }}</p>
      <p> Provinsi: {{ Province }}</p>
      <p>{{ seller?.picDistrict }}</p>
      <p>{{ seller?.picVillage }}</p>
      <p>{{ seller?.picRT }}</p>
      <p>{{ seller?.picRW }}</p>
    </div>
    <div>
      <h1>Identitas</h1>
      <p>{{ seller?.picEmail }}</p>
      <p>{{ seller?.picHp }}</p>
      <p>{{ seller?.picNoKTP }}</p>
      <p>{{ seller?.picName }}</p>
    </div>
    <div>
      <h1>Dokumen</h1>
      <p>{{ seller?.picUrlKTP }}</p>
      <p>{{ seller?.picUrlPhoto }}</p>
    </div>
    <div v-if="seller?.status === 'APPROVED'">
      <button
        class="btn btn-primary mt-4"
        @click="handleUpdate('APPROVED')"
      >
        APPROVED
      </button>
      <button
        class="btn btn-primary mt-4"
        @click="handleUpdate('CANCELLED')"
      >
        CANCELLED
      </button>
    </div>
  </div>
</template>
