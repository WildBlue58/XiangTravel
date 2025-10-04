import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Product,
  ProductCard,
  SearchResult,
  SearchParams,
} from "@/types/api";
import { productApi } from "@/api/supabase";

export const useProductStore = defineStore("product", () => {
  // 状态
  const products = ref<Product[]>([]);
  const featuredProducts = ref<Product[]>([]);
  const searchResults = ref<SearchResult>({
    products: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const productCards = computed<ProductCard[]>(() => {
    return products.value.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description || "",
      imageUrl: product.image_url || "",
      price: product.price,
      duration: product.duration,
      rating: product.rating,
    }));
  });

  const featuredProductCards = computed<ProductCard[]>(() => {
    return featuredProducts.value.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description || "",
      imageUrl: product.image_url || getDefaultImageUrl(product.title),
      price: product.price,
      duration: product.duration,
      rating: product.rating,
    }));
  });

  // 根据产品标题获取默认图片
  const getDefaultImageUrl = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("mountain") ||
      titleLower.includes("hiking") ||
      titleLower.includes("adventure")
    ) {
      return "https://picsum.photos/400/300?random=1";
    }
    if (
      titleLower.includes("yosemite") ||
      titleLower.includes("national park")
    ) {
      return "https://picsum.photos/400/300?random=2";
    }
    if (titleLower.includes("beach") || titleLower.includes("ocean")) {
      return "https://picsum.photos/400/300?random=3";
    }
    if (titleLower.includes("city") || titleLower.includes("urban")) {
      return "https://picsum.photos/400/300?random=4";
    }
    if (titleLower.includes("alps") || titleLower.includes("explore")) {
      return "https://picsum.photos/400/300?random=5";
    }
    if (titleLower.includes("tokyo") || titleLower.includes("discover")) {
      return "https://picsum.photos/400/300?random=6";
    }
    if (titleLower.includes("paris")) {
      return "https://picsum.photos/400/300?random=7";
    }
    if (titleLower.includes("rome")) {
      return "https://picsum.photos/400/300?random=8";
    }
    if (titleLower.includes("barcelona")) {
      return "https://picsum.photos/400/300?random=9";
    }
    if (titleLower.includes("london")) {
      return "https://picsum.photos/400/300?random=10";
    }
    // 默认旅游图片
    return "https://picsum.photos/400/300?random=11";
  };

  // 方法
  const fetchFeaturedProducts = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const products = await productApi.getFeaturedProducts();
      featuredProducts.value = products;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取推荐产品失败";
      console.error("获取推荐产品失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const searchProducts = async (params: SearchParams) => {
    try {
      isLoading.value = true;
      error.value = null;

      const results = await productApi.searchProducts(params);
      searchResults.value = results;
      products.value = results.products;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "搜索产品失败";
      console.error("搜索产品失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const product = await productApi.getProductById(id);
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取产品详情失败";
      console.error("获取产品详情失败:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearSearchResults = () => {
    searchResults.value = {
      products: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    products.value = [];
  };

  return {
    // 状态
    products,
    featuredProducts,
    searchResults,
    isLoading,
    error,

    // 计算属性
    productCards,
    featuredProductCards,

    // 方法
    fetchFeaturedProducts,
    searchProducts,
    getProductById,
    clearSearchResults,
  };
});
