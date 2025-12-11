<script setup lang="ts">
// Period filter
const selectedPeriod = ref("all");

// Fetch all stats data with period filter
const { data: productsByCategory } = await useFetch<Array<{ categoryName: string; productCount: number }>>("/api/admin/stats/products-by-category", {
  query: { period: selectedPeriod },
  watch: [selectedPeriod],
});
const { data: sellersByProvince } = await useFetch<Array<{ province: string; sellerCount: number }>>("/api/admin/stats/sellers-by-province", {
  query: { period: selectedPeriod },
  watch: [selectedPeriod],
});
const { data: sellersStatus } = await useFetch<{ active: number; inactive: number }>("/api/admin/stats/sellers-status", {
  query: { period: selectedPeriod },
  watch: [selectedPeriod],
});
const { data: reviewsStats } = await useFetch<{
  totalReviews: number;
  reviewsWithComments: number;
  reviewsWithRatingOnly: number;
  oneStarRating: number;
  twoStarRating: number;
  threeStarRating: number;
  fourStarRating: number;
  fiveStarRating: number;
}>("/api/admin/stats/reviews", {
  query: { period: selectedPeriod },
  watch: [selectedPeriod],
});

const { data: reviewsByRating } = await useFetch<{
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}>("/api/admin/stats/reviews-by-rating", {
  query: { period: selectedPeriod },
  watch: [selectedPeriod],
});

// Chart 1: Products by Category (Bar Chart)
const categoryLabels = computed(() => productsByCategory.value?.map(item => item.categoryName) || []);
const categoryData = computed(() => productsByCategory.value?.map(item => item.productCount) || []);

// Chart 2: Sellers by Province (Bar Chart - Top 10)
const provinceLabels = computed(() => sellersByProvince.value?.slice(0, 10).map(item => item.province) || []);
const provinceData = computed(() => sellersByProvince.value?.slice(0, 10).map(item => item.sellerCount) || []);

// Chart 3: Sellers Status (Doughnut Chart)
const sellersStatusLabels = ["Active", "Inactive"];
const sellersStatusData = computed(() => [
  sellersStatus.value?.active || 0,
  sellersStatus.value?.inactive || 0,
]);
const sellersStatusColors = ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"];

// Summary stats
const totalProducts = computed(() => categoryData.value.reduce((sum, val) => sum + val, 0));
const totalSellers = computed(() => (sellersStatus.value?.active || 0) + (sellersStatus.value?.inactive || 0));
const totalCategories = computed(() => categoryLabels.value.length);

// Reusable stat items for seller status
const sellerStatusItems = computed(() => [
  {
    label: "Active (Approved)",
    value: sellersStatus.value?.active || 0,
    icon: "tabler:circle-check",
    color: "bg-success/10",
  },
  {
    label: "Inactive (Pending/Cancelled)",
    value: sellersStatus.value?.inactive || 0,
    icon: "tabler:circle-x",
    color: "bg-error/10",
  },
]);

// Reusable stat items for reviews by rating
const reviewRatingItems = computed(() => [
  {
    label: "⭐ 1 Star",
    value: reviewsByRating.value?.rating1 || 0,
    color: "bg-error/10",
  },
  {
    label: "⭐⭐ 2 Stars",
    value: reviewsByRating.value?.rating2 || 0,
    color: "bg-warning/10",
  },
  {
    label: "⭐⭐⭐ 3 Stars",
    value: reviewsByRating.value?.rating3 || 0,
    color: "bg-info/10",
  },
  {
    label: "⭐⭐⭐⭐ 4 Stars",
    value: reviewsByRating.value?.rating4 || 0,
    color: "bg-primary/10",
  },
  {
    label: "⭐⭐⭐⭐⭐ 5 Stars",
    value: reviewsByRating.value?.rating5 || 0,
    color: "bg-success/10",
  },
]);

// Download reports
const isDownloading = ref<string | null>(null);

async function downloadReport(reportType: string) {
  isDownloading.value = reportType;
  try {
    const response = await fetch(`/api/admin/reports/${reportType}?period=${selectedPeriod.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${reportType}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  catch (error) {
    console.error("Error downloading report:", error);
    // eslint-disable-next-line no-alert
    alert("Gagal mengunduh laporan. Silakan coba lagi.");
  }
  finally {
    isDownloading.value = null;
  }
}
</script>

<template>
  <div class="container max-w-[1200px] mx-auto mt-8">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p class="text-base-content/60">
          Overview statistik platform CatalogApp
        </p>
      </div>

      <!-- Period Filter -->
      <div class="form-control w-48">
        <label class="label">
          <span class="label-text font-semibold">Periode Data</span>
        </label>
        <select v-model="selectedPeriod" class="select select-bordered">
          <option value="all">
            Semua Waktu
          </option>
          <option value="1d">
            1 Hari Terakhir
          </option>
          <option value="7d">
            7 Hari Terakhir
          </option>
          <option value="30d">
            30 Hari Terakhir
          </option>
        </select>
      </div>
    </div>

    <!-- Summary Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="stats shadow bg-primary/10 border border-primary/20">
        <div class="stat">
          <div class="stat-figure text-primary">
            <Icon name="tabler:package" size="32" />
          </div>
          <div class="stat-title">
            Total Products
          </div>
          <div class="stat-value text-primary">
            {{ totalProducts }}
          </div>
        </div>
      </div>

      <div class="stats shadow bg-info/10 border border-info/20">
        <div class="stat">
          <div class="stat-figure text-info">
            <Icon name="tabler:building-store" size="32" />
          </div>
          <div class="stat-title">
            Total Sellers
          </div>
          <div class="stat-value text-info">
            {{ totalSellers }}
          </div>
        </div>
      </div>

      <div class="stats shadow bg-success/10 border border-success/20">
        <div class="stat">
          <div class="stat-figure text-success">
            <Icon name="tabler:category" size="32" />
          </div>
          <div class="stat-title">
            Categories
          </div>
          <div class="stat-value text-success">
            {{ totalCategories }}
          </div>
        </div>
      </div>

      <div class="stats shadow bg-warning/10 border border-warning/20">
        <div class="stat">
          <div class="stat-figure text-warning">
            <Icon name="tabler:star" size="32" />
          </div>
          <div class="stat-title">
            Total Reviews
          </div>
          <div class="stat-value text-warning">
            {{ reviewsStats?.totalReviews || 0 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart 1: Products by Category -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:chart-bar" size="24" class="text-primary" />
            Sebaran Produk per Kategori
          </h2>
          <div class="h-80">
            <ChartsBarChart
              :labels="categoryLabels"
              :data="categoryData"
              label="Jumlah Produk"
              background-color="rgba(102, 126, 234, 0.8)"
              border-color="rgba(102, 126, 234, 1)"
            />
          </div>
        </div>
      </div>

      <!-- Chart 2: Sellers by Province -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:map-pin" size="24" class="text-info" />
            Sebaran Seller per Provinsi (Top 10)
          </h2>
          <div class="h-80">
            <ChartsBarChart
              :labels="provinceLabels"
              :data="provinceData"
              label="Jumlah Seller"
              background-color="rgba(59, 130, 246, 0.8)"
              border-color="rgba(59, 130, 246, 1)"
            />
          </div>
        </div>
      </div>

      <!-- Chart 3: Sellers Status -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:users" size="24" class="text-success" />
            Status Seller (Aktif vs Nonaktif)
          </h2>
          <div class="flex items-center justify-center">
            <div class="h-80 w-full max-w-md">
              <ChartsDoughnutChart
                :labels="sellersStatusLabels"
                :data="sellersStatusData"
                :background-color="sellersStatusColors"
              />
            </div>
          </div>
          <!-- Stats Detail using Reusable Component -->
          <div class="mt-4">
            <StatsStatCard
              :items="sellerStatusItems"
              cols="grid-cols-2"
            />
          </div>
        </div>
      </div>

      <!-- Chart 4: Reviews by Rating -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:star" size="24" class="text-warning" />
            Review Berdasarkan Rating
          </h2>
          <div class="flex items-center justify-center">
            <div class="h-80 w-full max-w-md">
              <ChartsDoughnutChart
                :labels="['⭐ 1', '⭐⭐ 2', '⭐⭐⭐ 3', '⭐⭐⭐⭐ 4', '⭐⭐⭐⭐⭐ 5']"
                :data="[
                  reviewsByRating?.rating1 || 0,
                  reviewsByRating?.rating2 || 0,
                  reviewsByRating?.rating3 || 0,
                  reviewsByRating?.rating4 || 0,
                  reviewsByRating?.rating5 || 0,
                ]"
                :background-color="[
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(249, 115, 22, 0.8)',
                  'rgba(234, 179, 8, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                ]"
              />
            </div>
          </div>
          <!-- Stats Detail using Reusable Component -->
          <div class="mt-4">
            <StatsStatCard :items="reviewRatingItems" />
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Reports Section -->
    <div class="card bg-base-200 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title mb-4">
          <Icon name="tabler:file-text" size="24" />
          Laporan Tambahan
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Report 1: Sellers Status -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="font-semibold flex items-center gap-2">
                <Icon name="tabler:users" size="20" class="text-success" />
                Daftar Seller Aktif & Nonaktif
              </h3>
              <p class="text-sm text-base-content/60 mt-2">
                Laporan lengkap semua seller dengan status aktif (approved) dan nonaktif (pending/cancelled).
              </p>
              <button
                class="btn btn-success btn-sm mt-4 gap-2"
                :disabled="isDownloading === 'sellers-status'"
                @click="downloadReport('sellers-status')"
              >
                <Icon
                  v-if="isDownloading === 'sellers-status'"
                  name="tabler:loader-2"
                  size="16"
                  class="animate-spin"
                />
                <Icon v-else name="tabler:download" size="16" />
                Unduh PDF
              </button>
            </div>
          </div>

          <!-- Report 2: Sellers by Province -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="font-semibold flex items-center gap-2">
                <Icon name="tabler:map-pin" size="20" class="text-info" />
                Daftar Seller per Provinsi
              </h3>
              <p class="text-sm text-base-content/60 mt-2">
                Laporan seller yang dikelompokkan berdasarkan provinsi dengan informasi lengkap.
              </p>
              <button
                class="btn btn-info btn-sm mt-4 gap-2"
                :disabled="isDownloading === 'sellers-by-province'"
                @click="downloadReport('sellers-by-province')"
              >
                <Icon
                  v-if="isDownloading === 'sellers-by-province'"
                  name="tabler:loader-2"
                  size="16"
                  class="animate-spin"
                />
                <Icon v-else name="tabler:download" size="16" />
                Unduh PDF
              </button>
            </div>
          </div>

          <!-- Report 3: Products by Rating -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="font-semibold flex items-center gap-2">
                <Icon name="tabler:star" size="20" class="text-warning" />
                Produk Berdasarkan Rating
              </h3>
              <p class="text-sm text-base-content/60 mt-2">
                Laporan produk diurutkan dari rating tertinggi dengan info toko, kategori, harga, dan provinsi.
              </p>
              <button
                class="btn btn-warning btn-sm mt-4 gap-2"
                :disabled="isDownloading === 'products-by-rating'"
                @click="downloadReport('products-by-rating')"
              >
                <Icon
                  v-if="isDownloading === 'products-by-rating'"
                  name="tabler:loader-2"
                  size="16"
                  class="animate-spin"
                />
                <Icon v-else name="tabler:download" size="16" />
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="card bg-base-200 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title">
          <Icon name="tabler:info-circle" size="24" />
          Informasi
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="mb-2">
              <strong>📊 Products by Category:</strong> Menampilkan distribusi produk di setiap kategori.
            </p>
            <p class="mb-2">
              <strong>📍 Sellers by Province:</strong> Menampilkan 10 provinsi dengan seller terbanyak.
            </p>
          </div>
          <div>
            <p class="mb-2">
              <strong>👥 Seller Status:</strong> Perbandingan seller aktif (approved) vs nonaktif (pending/cancelled).
            </p>
            <p class="mb-2">
              <strong>⭐ Reviews:</strong> Jumlah pengunjung yang memberikan komentar dan rating.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
