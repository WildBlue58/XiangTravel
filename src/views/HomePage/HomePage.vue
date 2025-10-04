<template>
  <div class="home min-h-screen bg-gray-50">
    <!-- 顶部渐变背景 -->
    <div
      class="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500 to-white -z-10"
    ></div>

    <!-- 搜索栏 -->
    <div class="px-4 pt-6 pb-4">
      <van-search
        v-model="searchField"
        placeholder="Q Where"
        show-action
        shape="round"
        background="transparent"
        class="mb-6"
        @search="handleSearch"
        @input="handleSearch"
      >
        <template #action>
          <div class="text-white">
            <van-icon name="shopping-cart-o" size="1.25rem" />
          </div>
        </template>
      </van-search>
    </div>

    <!-- 主要内容 -->
    <main class="px-4 pb-20">
      <!-- Explore 部分 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">Explore</h2>
        <div class="grid grid-cols-3 gap-6">
          <div
            v-for="item in exploreItems"
            :key="item.title"
            class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            @click="searchByCategory(item.category)"
          >
            <div
              class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3"
            >
              <van-icon :name="item.icon" size="1.8rem" color="#f97316" />
            </div>
            <span class="text-sm text-center text-gray-700 font-medium">{{
              item.title
            }}</span>
          </div>
        </div>
      </div>

      <!-- Recently Viewed 部分 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">Recently Viewed</h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in recentlyViewedItems"
            :key="item.id"
            class="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            @click="goToProductDetail(item.id)"
          >
            <img
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-28 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-base text-gray-900">
                {{ item.title }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ item.description }}</p>
              <div class="flex items-center justify-between mt-3">
                <div v-if="item.price" class="text-orange-500 font-semibold">
                  ${{ item.price }}
                </div>
                <van-icon
                  name="star-o"
                  size="1.2rem"
                  color="#d1d5db"
                  class="cursor-pointer hover:text-yellow-400 transition-colors"
                  @click="toggleFavorite(item.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { searchApi } from "@/api/supabase";
import type { ProductCard } from "@/types/api";

const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();

const searchField = ref<string>("");
const isSearching = ref(false);

// Explore 功能数据
const exploreItems = ref([
  { title: "Tours & Experiences", icon: "location-o", category: "tours" },
  { title: "Attraction Tickets", icon: "star-o", category: "tickets" },
  { title: "Hotels", icon: "home-o", category: "hotels" },
  { title: "Transportation", icon: "logistics", category: "transportation" },
  { title: "Car Rental", icon: "shop-o", category: "cars" },
  { title: "More", icon: "ellipsis", category: "all" },
]);

// 计算属性 - 最近浏览数据
const recentlyViewedItems = computed<ProductCard[]>(() => {
  return productStore.featuredProductCards.slice(0, 2);
});

// 搜索功能
const handleSearch = async () => {
  if (!searchField.value.trim()) return;

  try {
    isSearching.value = true;

    // 保存搜索历史
    if (userStore.currentUser) {
      await searchApi.saveSearchHistory(
        userStore.currentUser.id,
        searchField.value
      );
    }

    // 跳转到搜索结果页面
    router.push({
      path: "/search",
      query: { q: searchField.value },
    });
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    isSearching.value = false;
  }
};

// 按分类搜索
const searchByCategory = async (category: string) => {
  try {
    isSearching.value = true;

    // 跳转到搜索结果页面，传递分类参数
    router.push({
      path: "/search",
      query: {
        category: category === "all" ? undefined : category,
      },
    });
  } catch (error) {
    console.error("分类搜索失败:", error);
  } finally {
    isSearching.value = false;
  }
};

// 收藏功能
const toggleFavorite = async (productId: string) => {
  try {
    await favoriteStore.toggleFavorite(productId, "tours");
  } catch (error) {
    console.error("收藏操作失败:", error);
  }
};

// 跳转到产品详情页
const goToProductDetail = (productId: string) => {
  router.push(`/product/${productId}`);
};

// 组件挂载时加载数据
onMounted(async () => {
  await productStore.fetchFeaturedProducts();
  await userStore.fetchCurrentUser();
});
</script>
<style></style>
