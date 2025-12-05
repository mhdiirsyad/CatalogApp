<script setup lang="ts">
import type { SelectSeller } from "~/lib/db/schema";

const { data: sellers } = await useFetch<SelectSeller[]>("/api/admin/seller", {
  lazy: true,
});
</script>

<template>
  <div class="overflow-x-auto mt-8 bg-base-200 max-w-[1000px] mx-auto rounded-box border border-base-content/5">
    <table class="table">
      <!-- head -->
      <thead class="bg-accent">
        <tr>
          <th>Nama Toko</th>
          <th>Nama PIC</th>
          <th>Email PIC</th>
          <!-- <th>Provinsi</th> -->
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="seller in sellers"
          :key="seller.id"
          class="hover:bg-base-300"
          @click="navigateTo({ name: 'admin-dashboard-sellers-id', params: { id: seller.id } })"
        >
          <th>{{ seller.storeName }}</th>
          <td>{{ seller.picName }}</td>
          <td>{{ seller.picEmail }}</td>
          <td>
            <span v-if="seller.status === 'APPROVED'" class="badge badge-success">Verified</span>
            <span v-else class="badge badge-warning">Pending</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
