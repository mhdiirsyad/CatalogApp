<script setup lang="ts">
import type { SelectCategory } from "~/lib/db/schema";

const { data: categories, refresh } = await useFetch<SelectCategory[]>("/api/category/category", {
  lazy: true,
});

const { $csrfFetch } = useNuxtApp();

// Search
const searchQuery = ref("");
const filteredCategories = computed(() => {
  if (!categories.value)
    return [];
  if (!searchQuery.value)
    return categories.value;

  const query = searchQuery.value.toLowerCase();
  return categories.value.filter(cat =>
    cat.name.toLowerCase().includes(query)
    || cat.slug.toLowerCase().includes(query)
    || cat.description?.toLowerCase().includes(query),
  );
});

// Add/Edit Dialog
const isFormDialogOpen = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const selectedCategory = ref<SelectCategory | undefined>();

function openAddDialog() {
  dialogMode.value = "add";
  selectedCategory.value = undefined;
  isFormDialogOpen.value = true;
}

function openEditDialog(category: SelectCategory) {
  dialogMode.value = "edit";
  selectedCategory.value = category;
  isFormDialogOpen.value = true;
}

async function handleFormSuccess() {
  isFormDialogOpen.value = false;
  await refresh();
}

// Delete Dialog
const isDeleteDialogOpen = ref(false);
const categoryToDelete = ref<SelectCategory | undefined>();
const isDeleting = ref(false);

function openDeleteDialog(category: SelectCategory) {
  categoryToDelete.value = category;
  isDeleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!categoryToDelete.value)
    return;

  try {
    isDeleting.value = true;
    await $csrfFetch(`/api/admin/category/${categoryToDelete.value.id}`, {
      method: "DELETE",
    });
    isDeleteDialogOpen.value = false;
    await refresh();
  }
  catch (error) {
    console.error("Failed to delete category:", error);
  }
  finally {
    isDeleting.value = false;
  }
}

const categoryCount = computed(() => categories.value?.length || 0);

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <div class="container max-w-[1200px] mx-auto mt-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">
        Category Management
      </h1>
      <p class="text-base-content/60">
        Manage product categories for your catalog
      </p>
    </div>

    <!-- Stats Card -->
    <div class="stats shadow bg-primary/10 border border-primary/20 mb-6 w-full">
      <div class="stat">
        <div class="stat-figure text-primary">
          <Icon name="tabler:category" size="32" />
        </div>
        <div class="stat-title">
          Total Categories
        </div>
        <div class="stat-value text-primary">
          {{ categoryCount }}
        </div>
        <div class="stat-desc">
          Active product categories
        </div>
      </div>
    </div>

    <!-- Search and Add -->
    <div class="card bg-base-200 mb-4">
      <div class="card-body">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <label class="input input-bordered flex items-center gap-2 w-full md:w-96">
            <Icon name="tabler:search" size="20" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search by name, slug, or description..."
            >
          </label>
          <button class="btn btn-primary w-full md:w-auto" @click="openAddDialog">
            <Icon name="tabler:plus" size="20" />
            Add Category
          </button>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="overflow-x-auto bg-base-200 rounded-box border border-base-content/5">
      <table class="table table-zebra">
        <thead class="bg-accent">
          <tr>
            <th>
              <div class="flex items-center gap-2">
                <Icon name="tabler:tag" size="16" />
                Category Name
              </div>
            </th>
            <th>
              <div class="flex items-center gap-2">
                <Icon name="tabler:file-text" size="16" />
                Description
              </div>
            </th>
            <th>
              <div class="flex items-center gap-2">
                <Icon name="tabler:link" size="16" />
                Slug
              </div>
            </th>
            <th>
              <div class="flex items-center gap-2">
                <Icon name="tabler:calendar" size="16" />
                Created
              </div>
            </th>
            <th class="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="category in filteredCategories"
            :key="category.id"
            class="hover:bg-base-300"
          >
            <td>
              <div class="flex items-center gap-3">
                <!-- <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-lg w-10 h-10">
                    <Icon name="tabler:category" size="20" />
                  </div>
                </div> -->
                <div class="font-bold">
                  {{ category.name }}
                </div>
              </div>
            </td>
            <td>
              <div class="max-w-xs truncate">
                {{ category.description || '-' }}
              </div>
            </td>
            <td>
              <code class="badge badge-ghost font-mono text-xs">{{ category.slug }}</code>
            </td>
            <td>
              <div class="text-sm text-base-content/60">
                {{ formatDate(category.createdAt) }}
              </div>
            </td>
            <td>
              <div class="flex justify-center gap-2">
                <button
                  class="btn btn-sm btn-ghost text-info hover:bg-info/20"
                  @click.stop="openEditDialog(category)"
                >
                  <Icon name="tabler:edit" size="16" />
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-ghost text-error hover:bg-error/20"
                  @click.stop="openDeleteDialog(category)"
                >
                  <Icon name="tabler:trash" size="16" />
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredCategories.length">
            <td colspan="5" class="text-center py-12">
              <Icon name="tabler:folder-off" size="48" class="mx-auto mb-2 opacity-50" />
              <p class="text-base-content/60 mb-2">
                No categories found
              </p>
              <button class="btn btn-sm btn-primary" @click="openAddDialog">
                <Icon name="tabler:plus" size="16" />
                Create First Category
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results count -->
    <div class="mt-4 text-sm text-base-content/60 text-center">
      Showing {{ filteredCategories.length }} of {{ categoryCount }} categories
    </div>

    <!-- Form Dialog (Add/Edit) -->
    <AdminCategoryFormDialog
      :is-open="isFormDialogOpen"
      :mode="dialogMode"
      :category="selectedCategory"
      @close="isFormDialogOpen = false"
      @success="handleFormSuccess"
    />

    <!-- Delete Confirmation Dialog -->
    <AdminCategoryDeleteDialog
      :is-open="isDeleteDialogOpen"
      :category="categoryToDelete"
      @close="isDeleteDialogOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>
