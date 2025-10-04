<template>
  <div class="collection min-h-screen bg-gray-50">
    <!-- 顶部渐变背景 -->
    <div
      class="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500 to-white -z-10"
    ></div>

    <!-- 标题栏 -->
    <div class="px-4 pt-6 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">Saved</h1>
    </div>

    <!-- 主要内容 -->
    <main class="px-4 pb-20">
      <!-- 标签页 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <van-tabs v-model:active="activeTab" class="mb-0">
          <van-tab title="Tours" name="tours"></van-tab>
          <van-tab title="Tickets" name="tickets"></van-tab>
          <van-tab title="Hotels" name="hotels"></van-tab>
        </van-tabs>
      </div>

      <!-- 收藏列表 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="space-y-6">
          <div
            v-for="item in savedItems"
            :key="item.id"
            class="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img
              :src="item.imageUrl"
              :alt="item.title"
              class="w-20 h-20 rounded-xl object-cover"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-900">
                {{ item.title }}
              </h3>
              <p class="text-base text-gray-600 mt-1">{{ item.duration }}</p>
              <div v-if="item.price" class="text-orange-500 font-semibold mt-1">
                ${{ item.price }}
              </div>
            </div>
            <van-icon
              name="star"
              size="1.5rem"
              color="#fbbf24"
              class="cursor-pointer hover:opacity-80 transition-opacity"
              @click="removeFavorite(item.id)"
            />
          </div>

          <!-- 空状态 -->
          <div v-if="savedItems.length === 0" class="text-center py-12">
            <van-icon name="star-o" size="4rem" color="#d1d5db" />
            <p class="text-gray-500 mt-4">暂无收藏项目</p>
            <p class="text-sm text-gray-400 mt-2">去首页发现更多精彩内容吧</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useUserStore } from "@/store/userStore";

const favoriteStore = useFavoriteStore();
const userStore = useUserStore();

const activeTab = ref("tours");

// 计算属性 - 收藏项目数据
const savedItems = computed(() => {
  const favorites = favoriteStore.favoritesByCategory[activeTab.value] || [];
  return favorites
    .filter((fav) => fav.product)
    .map((fav) => ({
      id: fav.product!.id,
      title: fav.product!.title,
      description: fav.product!.description || "",
      duration: fav.product!.duration || "1 day",
      imageUrl: fav.product!.image_url || "",
      price: fav.product!.price,
      rating: fav.product!.rating,
    }));
});

// 监听标签页变化，重新加载对应分类的收藏
watch(activeTab, async (newTab) => {
  if (userStore.currentUser) {
    await favoriteStore.fetchUserFavorites(newTab);
  }
});

// 取消收藏
const removeFavorite = async (productId: string) => {
  try {
    await favoriteStore.removeFavorite(productId);
  } catch (error) {
    console.error("取消收藏失败:", error);
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  if (userStore.currentUser) {
    await favoriteStore.fetchUserFavorites(activeTab.value);
  }
});
</script>
