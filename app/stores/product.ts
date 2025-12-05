import { defineStore } from "pinia";

import type { SelectProductFull } from "~/lib/db/schema";

export const useProductStore = defineStore("useProductStore", () => {
  const route = useRoute();
  const searchQuery = ref("");
  const categoryFilter = ref<number | null>(null);

  const productQueryParams = computed(() => {
    const params = new URLSearchParams();
    if (searchQuery.value)
      params.set("search", searchQuery.value);
    if (categoryFilter.value)
      params.set("category", categoryFilter.value.toString());
    return params.toString() ? `?${params.toString()}` : "";
  });

  const {
    data: sellerProducts,
    status: sellerProductStatus,
    refresh: sellerProductRefresh,
  } = useFetch(
    () => `/api/seller/product${productQueryParams.value}`,
    {
      lazy: true,
      watch: [searchQuery, categoryFilter],
    },
  );

  const productWithSlug = computed(() => `/api/seller/product/${route.params.slug}`);

  const {
    data: selectedProduct,
    status: selectedProductStatus,
    error: selectedProductError,
    refresh: selectedProductRefresh,
  } = useFetch<SelectProductFull>(productWithSlug, {
    lazy: true,
    immediate: false,
  });

  // const {
  //   data: products,
  //   status: productStatus,
  //   refresh: productRefresh,
  // } = useFetch<SelectProductFull[]>("/api/guest/product");

  const {
    data: products,
    status: productStatus,
    refresh: productRefresh,
  } = useFetch(
    () => `/api/seller/product${productQueryParams.value}`,
    {
      lazy: true,
      watch: [searchQuery, categoryFilter],
    },
  );

  return {
    sellerProducts,
    sellerProductStatus,
    sellerProductRefresh,
    searchQuery,
    categoryFilter,
    selectedProduct,
    selectedProductStatus,
    selectedProductError,
    selectedProductRefresh,
    products,
    productStatus,
    productRefresh,
  };
});
