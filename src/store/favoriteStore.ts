import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Favorite, Product } from "@/types/api";
import { favoriteApi } from "@/api/supabase";
import { useUserStore } from "./userStore";

export const useFavoriteStore = defineStore("favorite", () => {
  // 状态
  const favorites = ref<Favorite[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const favoriteProducts = computed<Product[]>(() => {
    return favorites.value
      .filter((fav) => fav.product)
      .map((fav) => fav.product!);
  });

  const favoriteCount = computed(() => favorites.value.length);

  const favoritesByCategory = computed(() => {
    const categories: Record<string, Favorite[]> = {};
    favorites.value.forEach((fav) => {
      if (!categories[fav.category]) {
        categories[fav.category] = [];
      }
      categories[fav.category].push(fav);
    });
    return categories;
  });

  // 方法
  const fetchUserFavorites = async (category?: string) => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      isLoading.value = true;
      error.value = null;

      const userFavorites = await favoriteApi.getUserFavorites(
        userStore.currentUser.id,
        category
      );
      favorites.value = userFavorites;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取收藏列表失败";
      console.error("获取收藏列表失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const addFavorite = async (productId: string, category: string = "tours") => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      isLoading.value = true;
      error.value = null;

      const favorite = await favoriteApi.addFavorite(userStore.currentUser.id, {
        product_id: productId,
        category,
      });

      favorites.value.push(favorite);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "添加收藏失败";
      console.error("添加收藏失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFavorite = async (productId: string) => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      isLoading.value = true;
      error.value = null;

      await favoriteApi.removeFavorite(userStore.currentUser.id, productId);

      favorites.value = favorites.value.filter(
        (fav) => fav.product_id !== productId
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : "取消收藏失败";
      console.error("取消收藏失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const toggleFavorite = async (
    productId: string,
    category: string = "tours"
  ) => {
    const isFavorite = await isProductFavorite(productId);

    if (isFavorite) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId, category);
    }
  };

  const isProductFavorite = async (productId: string): Promise<boolean> => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return false;

    try {
      return await favoriteApi.isFavorite(userStore.currentUser.id, productId);
    } catch (err) {
      console.error("检查收藏状态失败:", err);
      return false;
    }
  };

  const clearFavorites = () => {
    favorites.value = [];
    error.value = null;
  };

  return {
    // 状态
    favorites,
    isLoading,
    error,

    // 计算属性
    favoriteProducts,
    favoriteCount,
    favoritesByCategory,

    // 方法
    fetchUserFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isProductFavorite,
    clearFavorites,
  };
});
