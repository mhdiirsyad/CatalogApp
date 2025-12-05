<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const { data: categories } = await useFetch<SelectCategory[]>("/api/category/category", {
  lazy: true,
});
</script>

<template>
  <div class="container max-w-[1000px] mx-auto mt-8">
    <h1 class="text-xl font-bold">
      Category
    </h1>
    <div class="flex justify-between items-center">
      <label class="input w-64">
        <Icon name="tabler:search" size="20" class="mr-2" />
        <input type="search" required placeholder="Search categories...">
      </label>
      <button class="btn btn-primary mb-4">
        <Icon name="tabler:square-rounded-plus-filled" size="24" />
        Add Category
      </button>
    </div>
    <div class="overflow-x-auto mt-4 bg-base-200 rounded-box border border-base-content/5">
      <table class="table">
        <!-- head -->
        <thead class="bg-accent">
          <tr>
            <th>Category</th>
            <th>Deskripsi</th>
            <th>Slug</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="category in categories"
            :key="category.id"
            class="hover:bg-base-300"
            @click="navigateTo({ name: 'admin-dashboard-categories-id', params: { id: category.id } })"
          >
            <th>{{ category.name }}</th>
            <td>{{ category.description }}</td>
            <td>{{ category.slug }}</td>
            <td class="flex flex-row gap-2">
              <button class="btn bg-blue-600">
                <Icon name="tabler:edit" size="16" />
              </button>
              <button class="btn btn-error">
                <Icon name="tabler:trash" size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
