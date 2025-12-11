<script setup lang="ts">
definePageMeta({ middleware: "auth" });

// Fetch statistics data
const { data: overview } = await useFetch("/api/seller/stats/overview", { lazy: true });
const { data: productsStock } = await useFetch<Array<{ name: string; stock: number }>>("/api/seller/stats/products-stock", { lazy: true });
const { data: productsRating } = await useFetch<Array<{ name: string; rating: number }>>("/api/seller/stats/products-rating", { lazy: true });

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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  </div>
</template>
