<template>
  <div class="search-results min-h-screen bg-gray-50">
    <!-- 顶部搜索栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div class="px-4 py-3">
        <div class="flex items-center space-x-3">
          <van-icon
            name="arrow-left"
            size="1.5rem"
            color="#666"
            class="cursor-pointer"
            @click="$router.back()"
          />
          <van-search
            v-model="searchQuery"
            placeholder="搜索目的地、活动..."
            shape="round"
            class="flex-1"
            @search="handleSearch"
            @input="handleSearchInput"
          />
          <van-icon
            name="filter-o"
            size="1.5rem"
            color="#666"
            class="cursor-pointer"
            @click="showFilterDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- 筛选标签栏 -->
    <div class="bg-white px-4 py-3 border-b border-gray-100">
      <div class="flex items-center space-x-3 overflow-x-auto">
        <van-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          :type="filter.active ? 'primary' : 'default'"
          size="medium"
          class="cursor-pointer"
          @click="toggleFilter()"
        >
          {{ filter.label }}
        </van-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="px-4 py-4">
      <!-- 结果统计 -->
      <div class="mb-4">
        <p class="text-sm text-gray-600">
          找到 {{ searchResults.total }} 个结果
          <span v-if="searchQuery" class="text-orange-500"
            >"{{ searchQuery }}"</span
          >
        </p>
      </div>

      <!-- 排序选项 -->
      <div class="mb-4">
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="sortBy"
            :options="sortOptions"
            @change="handleSortChange"
          />
        </van-dropdown-menu>
      </div>

      <!-- 结果列表 -->
      <div class="space-y-4">
        <div
          v-for="product in searchResults.products"
          :key="product.id"
          class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="goToProductDetail(product.id)"
        >
          <div class="flex space-x-4">
            <img
              :src="product.image_url || getDefaultImageUrl(product.title)"
              :alt="product.title"
              class="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                {{ product.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ product.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <van-icon name="star" size="0.875rem" color="#fbbf24" />
                    <span class="text-sm text-gray-600 ml-1">{{
                      product.rating || 4.5
                    }}</span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ product.duration || "1天" }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-orange-500">
                    ${{ product.price }}
                  </div>
                  <div class="text-xs text-gray-500">起</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="searchResults.products.length === 0 && !isLoading"
          class="text-center py-12"
        >
          <van-icon name="search" size="4rem" color="#d1d5db" />
          <p class="text-gray-500 mt-4">未找到相关结果</p>
          <p class="text-sm text-gray-400 mt-2">尝试使用不同的关键词</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-center py-8">
          <van-loading type="spinner" size="1.5rem" />
          <p class="text-gray-500 mt-2">搜索中...</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="searchResults.total > searchResults.limit" class="mt-6">
        <van-pagination
          v-model="currentPage"
          :total-items="searchResults.total"
          :items-per-page="searchResults.limit"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 筛选对话框 -->
    <van-dialog
      v-model:show="showFilterDialog"
      title="筛选条件"
      show-cancel-button
      @confirm="applyFilters"
    >
      <div class="p-6 space-y-6">
        <!-- 价格范围 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">价格范围</h3>
          <van-slider
            v-model="priceRange"
            :min="0"
            :max="1000"
            :step="50"
            range
          />
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>${{ priceRange[0] }}</span>
            <span>${{ priceRange[1] }}</span>
          </div>
        </div>

        <!-- 评分筛选 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">最低评分</h3>
          <van-radio-group v-model="minRating">
            <van-radio name="0">不限</van-radio>
            <van-radio name="3">3.0分以上</van-radio>
            <van-radio name="4">4.0分以上</van-radio>
            <van-radio name="4.5">4.5分以上</van-radio>
          </van-radio-group>
        </div>

        <!-- 分类筛选 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">分类</h3>
          <van-checkbox-group v-model="selectedCategories">
            <van-checkbox name="tours">游览体验</van-checkbox>
            <van-checkbox name="tickets">景点门票</van-checkbox>
            <van-checkbox name="hotels">酒店住宿</van-checkbox>
            <van-checkbox name="transportation">交通出行</van-checkbox>
            <van-checkbox name="cars">租车服务</van-checkbox>
          </van-checkbox-group>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";
import { searchApi } from "@/api/supabase";
import type { SearchResult, SearchParams } from "@/types/api";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();

// 搜索相关状态
const searchQuery = ref<string>("");
const isLoading = ref(false);
const currentPage = ref(1);
const showFilterDialog = ref(false);

// 排序选项
const sortBy = ref("rating");
const sortOptions = [
  { text: "评分最高", value: "rating" },
  { text: "价格最低", value: "price" },
  { text: "价格最高", value: "price_desc" },
  { text: "最新发布", value: "created_at" },
];

// 筛选条件
const priceRange = ref<[number, number]>([0, 1000]);
const minRating = ref("0");
const selectedCategories = ref<string[]>([]);

// 计算属性
const searchResults = computed<SearchResult>(() => productStore.searchResults);
const activeFilters = computed(() => [
  {
    key: "price",
    label: `$${priceRange.value[0]}-${priceRange.value[1]}`,
    active: priceRange.value[0] > 0 || priceRange.value[1] < 1000,
  },
  {
    key: "rating",
    label: `${minRating.value}分以上`,
    active: minRating.value !== "0",
  },
  {
    key: "category",
    label: `${selectedCategories.value.length}个分类`,
    active: selectedCategories.value.length > 0,
  },
]);

// 获取默认图片
const getDefaultImageUrl = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("mountain") || titleLower.includes("hiking")) {
    return "https://picsum.photos/400/300?random=1";
  }
  if (titleLower.includes("beach") || titleLower.includes("ocean")) {
    return "https://picsum.photos/400/300?random=2";
  }
  if (titleLower.includes("city") || titleLower.includes("urban")) {
    return "https://picsum.photos/400/300?random=3";
  }
  return "https://picsum.photos/400/300?random=4";
};

// 搜索处理
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;

  await performSearch();
};

const handleSearchInput = async () => {
  // 防抖搜索
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch();
    }
  }, 500);
};

const searchTimeout = ref<NodeJS.Timeout>();

const performSearch = async () => {
  try {
    isLoading.value = true;

    const searchParams: SearchParams = {
      query: searchQuery.value,
      page: currentPage.value,
      limit: 10,
      sort: sortBy.value as SearchParams["sort"],
    };

    // 添加筛选条件
    if (priceRange.value[0] > 0 || priceRange.value[1] < 1000) {
      searchParams.minPrice = priceRange.value[0];
      searchParams.maxPrice = priceRange.value[1];
    }

    if (minRating.value !== "0") {
      searchParams.minRating = parseFloat(minRating.value);
    }

    if (selectedCategories.value.length > 0) {
      searchParams.categories = selectedCategories.value;
    }

    await productStore.searchProducts(searchParams);

    // 保存搜索历史
    if (userStore.currentUser) {
      await searchApi.saveSearchHistory(
        userStore.currentUser.id,
        searchQuery.value
      );
    }
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 排序处理
const handleSortChange = () => {
  performSearch();
};

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  performSearch();
};

// 筛选处理
const toggleFilter = () => {
  showFilterDialog.value = true;
};

// 移除未使用的函数

const applyFilters = () => {
  currentPage.value = 1;
  performSearch();
};

// 跳转到产品详情
const goToProductDetail = (productId: string) => {
  router.push(`/product/${productId}`);
};

// 监听路由参数变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery && newQuery.q) {
      searchQuery.value = newQuery.q as string;
      performSearch();
    }
  },
  { immediate: true }
);

// 组件挂载时初始化
onMounted(() => {
  if (route.query && route.query.q) {
    searchQuery.value = route.query.q as string;
    performSearch();
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
</style>
