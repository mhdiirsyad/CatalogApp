import { defineStore } from "pinia";

import type { SelectProductFull } from "~/lib/db/schema";

export const useProductStore = defineStore("useProductStore", () => {
  const route = useRoute();
  const searchQuery = ref("");
  const categoryFilter = ref<number | null>(null);
  const provinceFilter = ref("");
  const cityFilter = ref("");

  const productQueryParams = computed(() => {
    const params = new URLSearchParams();
    if (searchQuery.value) {
      params.set("search", searchQuery.value);
    }
    if (categoryFilter.value)
      params.set("categoryId", categoryFilter.value.toString() || "");
    if (provinceFilter.value)
      params.set("province", provinceFilter.value);
    if (cityFilter.value)
      params.set("city", cityFilter.value);
    return params.toString() ? `?${params.toString()}` : "";
  });

  // const {
  //   data: sellerProducts,
  //   status: sellerProductStatus,
  //   refresh: sellerProductRefresh,
  // } = useFetch<SelectProductFull[]>(
  //   () => `/api/seller/product${productQueryParams.value}`,
  //   {
  //     lazy: true,
  //     watch: [searchQuery, categoryFilter],
  //   },
  // );

  const productWithSlug = computed(() => `/api/product/${route.params.slug}`);

  const {
    data: selectedProduct,
    status: selectedProductStatus,
    error: selectedProductError,
    refresh: selectedProductRefresh,
  } = useFetch<SelectProductFull>(productWithSlug, {
    lazy: true,
    immediate: false,
  });

  const {
    data: products,
    status: productStatus,
    refresh: productRefresh,
  } = useFetch<SelectProductFull[]>(
    () => `/api/product/product${productQueryParams.value}`,
    {
      lazy: true,
      watch: [searchQuery, categoryFilter, provinceFilter, cityFilter],
    },
  );

  return {
    searchQuery,
    categoryFilter,
    provinceFilter,
    cityFilter,
    selectedProduct,
    selectedProductStatus,
    selectedProductError,
    selectedProductRefresh,
    products,
    productStatus,
    productRefresh,
  };
});
