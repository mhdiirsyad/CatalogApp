<script setup lang="ts">
definePageMeta({ middleware: "auth" });

// Fetch statistics data
const { data: overview } = await useFetch("/api/seller/stats/overview", { lazy: true });
const { data: productsStock } = await useFetch<Array<{ name: string; stock: number }>>("/api/seller/stats/products-stock", { lazy: true });
const { data: productsRating } = await useFetch<Array<{ name: string; rating: number }>>("/api/seller/stats/products-rating", { lazy: true });
const { data: ratingDistribution } = await useFetch<{
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ rating: number; count: number; percentage: number }>;
}>("/api/seller/stats/rating-distribution", { lazy: true });
const { data: ratingByProvince } = await useFetch<Array<{
  province: string;
  count: number;
  avgRating: number;
}>>("/api/seller/stats/rating-by-province", { lazy: true });

// Chart data for stock
const stockLabels = computed(() => productsStock.value?.map(p => p.name) || []);
const stockData = computed(() => productsStock.value?.map(p => p.stock) || []);
const stockColors = computed(() =>
  productsStock.value?.map((p) => {
    if (p.stock === 0)
      return "#ef4444"; // red - out of stock
    if (p.stock < 10)
      return "#f59e0b"; // amber - low stock
    if (p.stock < 50)
      return "#3b82f6"; // blue - medium stock
    return "#10b981"; // green - good stock
  }) || [],
);

// Chart data for rating
const ratingLabels = computed(() => productsRating.value?.map(p => p.name) || []);
const ratingData = computed(() => productsRating.value?.map(p => Number(p.rating.toFixed(1))) || []);
const ratingColors = computed(() =>
  productsRating.value?.map((p) => {
    if (p.rating >= 4.5)
      return "#10b981"; // green - excellent
    if (p.rating >= 4.0)
      return "#3b82f6"; // blue - good
    if (p.rating >= 3.0)
      return "#f59e0b"; // amber - average
    return "#ef4444"; // red - poor
  }) || [],
);

// Helper function to get star rating color
function getStarColor(rating: number) {
  if (rating >= 4)
    return "#10b981"; // green
  if (rating >= 3)
    return "#3b82f6"; // blue
  if (rating >= 2)
    return "#f59e0b"; // amber
  return "#ef4444"; // red
}
</script>

<template>
  <div class="container max-w-[1400px] mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        Dashboard Seller
      </h1>
      <p class="text-base-content/60">
        Overview statistik toko dan produk Anda
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Products -->
      <div class="stats shadow bg-primary/10 border border-primary/20">
        <div class="stat">
          <div class="stat-figure text-primary">
            <Icon name="tabler:box-seam" size="32" />
          </div>
          <div class="stat-title">
            Total Produk
          </div>
          <div class="stat-value text-primary">
            {{ overview?.totalProducts || 0 }}
          </div>
          <div class="stat-desc">
            Produk terdaftar
          </div>
        </div>
      </div>

      <!-- Total Stock -->
      <div class="stats shadow bg-success/10 border border-success/20">
        <div class="stat">
          <div class="stat-figure text-success">
            <Icon name="tabler:packages" size="32" />
          </div>
          <div class="stat-title">
            Total Stok
          </div>
          <div class="stat-value text-success">
            {{ overview?.totalStock || 0 }}
          </div>
          <div class="stat-desc">
            Unit tersedia
          </div>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="stats shadow bg-warning/10 border border-warning/20">
        <div class="stat">
          <div class="stat-figure text-warning">
            <Icon name="tabler:alert-triangle" size="32" />
          </div>
          <div class="stat-title">
            Stok Rendah
          </div>
          <div class="stat-value text-warning">
            {{ overview?.lowStockProducts || 0 }}
          </div>
          <div class="stat-desc">
            Produk &lt; 2 unit
          </div>
        </div>
      </div>

      <!-- Total Reviews -->
      <div class="stats shadow bg-info/10 border border-info/20">
        <div class="stat">
          <div class="stat-figure text-info">
            <Icon name="tabler:star" size="32" />
          </div>
          <div class="stat-title">
            Total Review
          </div>
          <div class="stat-value text-info">
            {{ overview?.totalReviews || 0 }}
          </div>
          <div class="stat-desc">
            Rating pelanggan
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Stock Chart -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:chart-bar" size="24" class="text-primary" />
            Sebaran Stok Produk
          </h2>
          <div v-if="productsStock && productsStock.length > 0" class="h-96">
            <ChartsBarChart
              :labels="stockLabels"
              :data="stockData"
              :background-color="stockColors"
              label="Stok"
            />
          </div>
          <div v-else class="h-96 flex items-center justify-center">
            <div class="text-center">
              <Icon name="tabler:box-off" size="48" class="mx-auto mb-2 opacity-50" />
              <p class="text-base-content/60">
                Belum ada produk
              </p>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-3 text-sm">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#ef4444]" />
              <span>Habis (0)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#f59e0b]" />
              <span>Rendah (&lt;2)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#3b82f6]" />
              <span>Sedang (&lt;50)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#10b981]" />
              <span>Baik (≥50)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Chart -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="tabler:chart-dots" size="24" class="text-warning" />
            Sebaran Rating Produk
          </h2>
          <div v-if="productsRating && productsRating.length > 0" class="h-96">
            <ChartsBarChart
              :labels="ratingLabels"
              :data="ratingData"
              :background-color="ratingColors"
              label="Rating"
            />
          </div>
          <div v-else class="h-96 flex items-center justify-center">
            <div class="text-center">
              <Icon name="tabler:star-off" size="48" class="mx-auto mb-2 opacity-50" />
              <p class="text-base-content/60">
                Belum ada rating
              </p>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-3 text-sm">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#10b981]" />
              <span>Excellent (≥4.5)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#3b82f6]" />
              <span>Good (≥4.0)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#f59e0b]" />
              <span>Average (≥3.0)</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-[#ef4444]" />
              <span>Poor (&lt;3.0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Statistics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Rating Distribution Card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4 flex items-center gap-2">
            <Icon name="tabler:star-filled" size="24" class="text-warning" />
            Distribusi Rating
          </h2>

          <div v-if="ratingDistribution && ratingDistribution.totalReviews > 0">
            <!-- Average Rating Display -->
            <div class="flex items-center justify-center mb-8 p-6 bg-base-300 rounded-lg">
              <div class="text-center">
                <div class="text-6xl font-bold text-warning mb-2">
                  {{ ratingDistribution.averageRating }}
                </div>
                <div class="flex items-center justify-center gap-1 mb-2">
                  <Icon
                    v-for="star in 5"
                    :key="star"
                    name="tabler:star-filled"
                    size="24"
                    :class="star <= Math.round(ratingDistribution.averageRating) ? 'text-warning' : 'text-base-content/20'"
                  />
                </div>
                <p class="text-sm text-base-content/60">
                  Dari {{ ratingDistribution.totalReviews }} review
                </p>
              </div>
            </div>

            <!-- Rating Bars -->
            <div class="space-y-3">
              <div
                v-for="item in ratingDistribution.distribution.slice().reverse()"
                :key="item.rating"
                class="flex items-center gap-3"
              >
                <div class="flex items-center gap-1 w-16">
                  <span class="text-sm font-medium">{{ item.rating }}</span>
                  <Icon name="tabler:star-filled" size="16" class="text-warning" />
                </div>
                <div class="flex-1">
                  <div class="w-full bg-base-300 rounded-full h-6 overflow-hidden">
                    <div
                      class="h-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all duration-300"
                      :style="{
                        width: `${item.percentage}%`,
                        backgroundColor: getStarColor(item.rating),
                      }"
                    >
                      <span v-if="item.percentage > 15">{{ item.percentage }}%</span>
                    </div>
                  </div>
                </div>
                <div class="text-sm text-base-content/60 w-12 text-right">
                  {{ item.count }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center py-20">
            <div class="text-center">
              <Icon name="tabler:star-off" size="48" class="mx-auto mb-2 opacity-50" />
              <p class="text-base-content/60">
                Belum ada review
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating by Province Card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4 flex items-center gap-2">
            <Icon name="tabler:map-pin" size="24" class="text-primary" />
            Sebaran Review per Provinsi
          </h2>

          <div v-if="ratingByProvince && ratingByProvince.length > 0" class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <div
              v-for="(item, index) in ratingByProvince"
              :key="item.province"
              class="p-4 bg-base-300 rounded-lg hover:bg-base-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">
                    #{{ index + 1 }}
                  </div>
                  <span class="font-semibold">{{ item.province }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon name="tabler:star-filled" size="16" class="text-warning" />
                  <span class="font-bold">{{ item.avgRating }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-base-content/60">
                  {{ item.count }} review{{ item.count > 1 ? 's' : '' }}
                </span>
                <div class="w-32">
                  <div class="w-full bg-base-200 rounded-full h-2">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :style="{
                        width: `${(item.avgRating / 5) * 100}%`,
                        backgroundColor: getStarColor(item.avgRating),
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center py-20">
            <div class="text-center">
              <Icon name="tabler:map-off" size="48" class="mx-auto mb-2 opacity-50" />
              <p class="text-base-content/60">
                Belum ada data provinsi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Section -->
    <div class="card bg-linear-to-br from-primary/10 to-secondary/10 shadow-xl border-2 border-primary/20">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4 flex items-center gap-2">
          <Icon name="tabler:file-download" size="28" class="text-primary" />
          Download Laporan PDF
        </h2>
        <p class="text-base-content/70 mb-6">
          Generate dan download laporan produk dalam format PDF untuk analisis dan dokumentasi
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Report 1: Stock Report -->
          <div class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-3">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <Icon name="tabler:packages" size="28" class="text-primary" />
                </div>
                <h3 class="font-bold text-lg">
                  Laporan Stok
                </h3>
              </div>
              <p class="text-sm text-base-content/70 mb-4 min-h-12">
                Daftar produk diurutkan berdasarkan stok (tertinggi ke terendah) lengkap dengan status stok dan harga
              </p>
              <a
                href="/api/seller/reports/products-stock"
                target="_blank"
                class="btn btn-primary btn-sm gap-2"
              >
                <Icon name="tabler:download" size="18" />
                Download PDF
              </a>
            </div>
          </div>

          <!-- Report 2: Rating Report -->
          <div class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-3">
                <div class="p-3 bg-warning/10 rounded-lg">
                  <Icon name="tabler:star" size="28" class="text-warning" />
                </div>
                <h3 class="font-bold text-lg">
                  Laporan Rating
                </h3>
              </div>
              <p class="text-sm text-base-content/70 mb-4 min-h-12">
                Daftar produk diurutkan berdasarkan rating (tertinggi ke terendah) untuk evaluasi kualitas produk
              </p>
              <a
                href="/api/seller/reports/products-rating"
                target="_blank"
                class="btn btn-warning btn-sm gap-2"
              >
                <Icon name="tabler:download" size="18" />
                Download PDF
              </a>
            </div>
          </div>

          <!-- Report 3: Restock Report -->
          <div class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-3">
                <div class="p-3 bg-error/10 rounded-lg">
                  <Icon name="tabler:alert-triangle" size="28" class="text-error" />
                </div>
                <h3 class="font-bold text-lg">
                  Perlu Restock
                </h3>
              </div>
              <p class="text-sm text-base-content/70 mb-4 min-h-12">
                Daftar produk dengan stok &lt; 2 unit yang memerlukan pemesanan ulang segera
              </p>
              <a
                href="/api/seller/reports/products-restock"
                target="_blank"
                class="btn btn-error btn-sm gap-2"
              >
                <Icon name="tabler:download" size="18" />
                Download PDF
              </a>
            </div>
          </div>
        </div>

        <div class="alert alert-info mt-6">
          <Icon name="tabler:info-circle" size="20" />
          <span class="text-sm">
            <strong>Tips:</strong> Laporan akan dibuka di tab baru. Pastikan popup blocker tidak menghalangi download.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
