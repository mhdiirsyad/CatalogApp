<script setup lang="ts">
import type { SelectSeller } from "~/lib/db/schema";

const { data: sellers, status: sellersStatus } = await useFetch<SelectSeller[]>("/api/admin/seller", {
  lazy: true,
});

// Search and filter
const searchQuery = ref("");
const statusFilter = ref<"ALL" | "PENDING" | "APPROVED" | "CANCELLED">("ALL");

const filteredSellers = computed(() => {
  if (!sellers.value)
    return [];

  let filtered = sellers.value;

  // Filter by status
  if (statusFilter.value !== "ALL") {
    filtered = filtered.filter(seller => seller.status === statusFilter.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(seller =>
      seller.storeName.toLowerCase().includes(query)
      || seller.picName.toLowerCase().includes(query)
      || seller.picEmail.toLowerCase().includes(query),
    );
  }

  return filtered;
});

const statusCounts = computed(() => {
  if (!sellers.value)
    return { pending: 0, approved: 0, cancelled: 0 };

  return {
    pending: sellers.value.filter(s => s.status === "PENDING").length,
    approved: sellers.value.filter(s => s.status === "APPROVED").length,
    cancelled: sellers.value.filter(s => s.status === "CANCELLED").length,
  };
});

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
        Seller Management
      </h1>
      <p class="text-base-content/60">
        Review and manage seller registrations
      </p>
    </div>
    <div v-if="sellersStatus === 'pending'" class="flex justify-center items-center h-32">
      <span class="loading loading-dots loading-xl" />
    </div>
    <div>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="stats shadow bg-warning/10 border border-warning/20">
          <div class="stat">
            <div class="stat-figure text-warning">
              <Icon name="tabler:clock" size="32" />
            </div>
            <div class="stat-title">
              Pending Review
            </div>
            <div class="stat-value text-warning">
              {{ statusCounts.pending }}
            </div>
            <div class="stat-desc">
              Waiting for approval
            </div>
          </div>
        </div>

        <div class="stats shadow bg-success/10 border border-success/20">
          <div class="stat">
            <div class="stat-figure text-success">
              <Icon name="tabler:circle-check" size="32" />
            </div>
            <div class="stat-title">
              Approved
            </div>
            <div class="stat-value text-success">
              {{ statusCounts.approved }}
            </div>
            <div class="stat-desc">
              Active sellers
            </div>
          </div>
        </div>

        <div class="stats shadow bg-error/10 border border-error/20">
          <div class="stat">
            <div class="stat-figure text-error">
              <Icon name="tabler:circle-x" size="32" />
            </div>
            <div class="stat-title">
              Cancelled
            </div>
            <div class="stat-value text-error">
              {{ statusCounts.cancelled }}
            </div>
            <div class="stat-desc">
              Rejected registrations
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card bg-base-200 mb-4">
        <div class="card-body">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search -->
            <label class="input input-bordered flex items-center gap-2 flex-1">
              <Icon name="tabler:search" size="20" />
              <input
                v-model="searchQuery"
                type="text"
                class="grow"
                placeholder="Search by store name, PIC name, or email..."
              >
            </label>

            <!-- Status Filter -->
            <div class="tabs tabs-boxed bg-base-300">
              <button
                class="tab"
                :class="{ 'tab-active': statusFilter === 'ALL' }"
                @click="statusFilter = 'ALL'"
              >
                All
              </button>
              <button
                class="tab"
                :class="{ 'tab-active': statusFilter === 'PENDING' }"
                @click="statusFilter = 'PENDING'"
              >
                <Icon name="tabler:clock" size="16" class="mr-1" />
                Pending
              </button>
              <button
                class="tab"
                :class="{ 'tab-active': statusFilter === 'APPROVED' }"
                @click="statusFilter = 'APPROVED'"
              >
                <Icon name="tabler:check" size="16" class="mr-1" />
                Approved
              </button>
              <button
                class="tab"
                :class="{ 'tab-active': statusFilter === 'CANCELLED' }"
                @click="statusFilter = 'CANCELLED'"
              >
                <Icon name="tabler:x" size="16" class="mr-1" />
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sellers Table -->
      <div class="overflow-x-auto bg-base-200 rounded-box border border-base-content/5">
        <table class="table table-zebra">
          <thead class="bg-accent">
            <tr>
              <th>Store Name</th>
              <th>PIC Name</th>
              <th>Contact</th>
              <th>Registered</th>
              <th class="text-center">
                Status
              </th>
              <th class="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="seller in filteredSellers"
              :key="seller.id"
              class="hover:bg-base-300 cursor-pointer"
            >
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content rounded-full w-10">
                      <img :src="getInitials(seller.storeName)">
                    </div>
                  </div>
                  <div>
                    <div class="font-bold">
                      {{ seller.storeName }}
                    </div>
                    <div class="text-sm text-base-content/60">
                      {{ seller.description.substring(0, 40) }}{{ seller.description.length > 40 ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="font-medium">
                  {{ seller.picName }}
                </div>
                <div class="text-sm text-base-content/60">
                  KTP: {{ seller.picNoKTP }}
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-sm">
                    <Icon name="tabler:mail" size="14" />
                    {{ seller.picEmail }}
                  </div>
                  <div class="flex items-center gap-1 text-sm text-base-content/60">
                    <Icon name="tabler:phone" size="14" />
                    {{ seller.picHp }}
                  </div>
                </div>
              </td>
              <td>
                <div class="text-sm">
                  {{ formatDate(seller.createdAt) }}
                </div>
              </td>
              <td class="text-center">
                <span
                  v-if="seller.status === 'APPROVED'"
                  class="badge badge-success gap-1"
                >
                  <Icon name="tabler:check" size="14" />
                  Verified
                </span>
                <span
                  v-else-if="seller.status === 'PENDING'"
                  class="badge badge-warning gap-1"
                >
                  <Icon name="tabler:clock" size="14" />
                  Pending
                </span>
                <span
                  v-else
                  class="badge badge-error gap-1"
                >
                  <Icon name="tabler:x" size="14" />
                  Cancelled
                </span>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-ghost"
                  @click="navigateTo({ name: 'admin-dashboard-sellers-id', params: { id: seller.id } })"
                >
                  <Icon name="tabler:eye" size="16" />
                  View Details
                </button>
              </td>
            </tr>
            <tr v-if="!filteredSellers.length">
              <td colspan="6" class="text-center py-12">
                <Icon name="tabler:users-off" size="48" class="mx-auto mb-2 opacity-50" />
                <p class="text-base-content/60">
                  No sellers found
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Results count -->
      <div class="mt-4 text-sm text-base-content/60 text-center">
        Showing {{ filteredSellers.length }} of {{ sellers?.length || 0 }} sellers
      </div>
    </div>
  </div>
</template>
