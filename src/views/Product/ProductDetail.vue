<template>
  <div class="product-detail min-h-screen bg-gray-50 pb-20">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div class="px-4 py-3 flex items-center justify-between">
        <van-icon
          name="arrow-left"
          size="1.5rem"
          color="#333"
          class="cursor-pointer"
          @click="$router.back()"
        />
        <div class="flex items-center space-x-3">
          <van-icon
            name="share-o"
            size="1.5rem"
            color="#666"
            class="cursor-pointer"
            @click="shareProduct"
          />
          <van-icon
            name="star"
            size="1.5rem"
            :color="isFavorite ? '#fbbf24' : '#d1d5db'"
            class="cursor-pointer"
            @click="toggleFavorite"
          />
        </div>
      </div>
    </div>

    <!-- 产品图片轮播 -->
    <div class="relative">
      <van-swipe
        :autoplay="3000"
        indicator-color="white"
        class="h-80"
        @change="onSwipeChange"
      >
        <van-swipe-item v-for="(image, index) in productImages" :key="index">
          <img
            :src="image"
            :alt="product?.title"
            class="w-full h-full object-cover"
          />
        </van-swipe-item>
      </van-swipe>

      <!-- 图片指示器 -->
      <div
        class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm"
      >
        {{ currentImageIndex + 1 }} / {{ productImages.length }}
      </div>
    </div>

    <!-- 产品信息 -->
    <div class="bg-white p-6">
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ product?.title }}
        </h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <van-icon name="star" size="1rem" color="#fbbf24" />
            <span class="text-sm text-gray-600 ml-1">{{
              product?.rating || 4.5
            }}</span>
            <span class="text-sm text-gray-500 ml-2"
              >({{ reviewCount }} 条评价)</span
            >
          </div>
          <div class="text-sm text-gray-500">
            {{ product?.duration || "1天" }}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <p class="text-gray-700 leading-relaxed">
          {{ product?.description }}
        </p>
      </div>

      <!-- 价格信息 -->
      <div class="bg-orange-50 rounded-xl p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-orange-500">
              ${{ product?.price }}
            </div>
            <div class="text-sm text-gray-600">起/人</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 line-through">
              ${{ originalPrice }}
            </div>
            <div class="text-sm text-green-600 font-semibold">
              {{ discount }}% 折扣
            </div>
          </div>
        </div>
      </div>

      <!-- 特色标签 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">产品特色</h3>
        <div class="flex flex-wrap gap-2">
          <van-tag
            v-for="feature in productFeatures"
            :key="feature"
            type="primary"
            size="medium"
          >
            {{ feature }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 详细信息标签页 -->
    <div class="bg-white mt-4">
      <van-tabs v-model:active="activeTab" sticky @click-tab="onTabClick">
        <van-tab title="详情" name="details">
          <div class="p-6">
            <div class="space-y-6">
              <!-- 行程安排 -->
              <div>
                <h3 class="text-lg font-semibold mb-3">行程安排</h3>
                <div class="space-y-3">
                  <div
                    v-for="(schedule, index) in itinerary"
                    :key="index"
                    class="flex items-start space-x-3"
                  >
                    <div
                      class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-sm font-semibold text-orange-600">{{
                        index + 1
                      }}</span>
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-900">
                        {{ schedule.time }}
                      </div>
                      <div class="text-gray-600">{{ schedule.activity }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 包含服务 -->
              <div>
                <h3 class="text-lg font-semibold mb-3">包含服务</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="service in includedServices"
                    :key="service"
                    class="flex items-center space-x-2"
                  >
                    <van-icon name="success" size="1rem" color="#10b981" />
                    <span class="text-sm text-gray-700">{{ service }}</span>
                  </div>
                </div>
              </div>

              <!-- 注意事项 -->
              <div>
                <h3 class="text-lg font-semibold mb-3">注意事项</h3>
                <div class="space-y-2">
                  <div
                    v-for="(note, index) in importantNotes"
                    :key="index"
                    class="flex items-start space-x-2"
                  >
                    <van-icon
                      name="info-o"
                      size="1rem"
                      color="#f59e0b"
                      class="mt-0.5"
                    />
                    <span class="text-sm text-gray-700">{{ note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="评价" name="reviews">
          <div class="p-6">
            <!-- 评分统计 -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <div class="flex items-center justify-between mb-4">
                <div class="text-3xl font-bold text-gray-900">
                  {{ product?.rating || 4.5 }}
                </div>
                <div class="text-right">
                  <div class="flex items-center mb-1">
                    <van-icon name="star" size="1rem" color="#fbbf24" />
                    <span class="text-sm text-gray-600 ml-1"
                      >基于 {{ reviewCount }} 条评价</span
                    >
                  </div>
                  <div class="text-sm text-gray-500">
                    推荐度 {{ recommendationRate }}%
                  </div>
                </div>
              </div>

              <!-- 评分分布 -->
              <div class="space-y-2">
                <div
                  v-for="rating in ratingDistribution"
                  :key="rating.stars"
                  class="flex items-center space-x-2"
                >
                  <span class="text-sm w-8">{{ rating.stars }}星</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-orange-500 h-2 rounded-full"
                      :style="{ width: rating.percentage + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600 w-8">{{
                    rating.count
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 评价列表 -->
            <div class="space-y-4">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <img
                      :src="review.userAvatar"
                      :alt="review.userName"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div class="font-semibold text-gray-900">
                        {{ review.userName }}
                      </div>
                      <div class="flex items-center">
                        <van-icon name="star" size="0.875rem" color="#fbbf24" />
                        <span class="text-sm text-gray-600 ml-1">{{
                          review.rating
                        }}</span>
                        <span class="text-sm text-gray-500 ml-2">{{
                          review.date
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-gray-700 leading-relaxed">
                  {{ review.content }}
                </p>
                <div v-if="review.images.length > 0" class="mt-3">
                  <div class="flex space-x-2">
                    <img
                      v-for="(image, index) in review.images.slice(0, 3)"
                      :key="index"
                      :src="image"
                      :alt="`评价图片${index + 1}`"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载更多评价 -->
            <div v-if="hasMoreReviews" class="text-center mt-6">
              <van-button
                type="default"
                size="large"
                @click="loadMoreReviews"
                :loading="loadingReviews"
              >
                加载更多评价
              </van-button>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部预订栏 -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-2xl font-bold text-orange-500">
            ${{ product?.price }}
          </div>
          <div class="text-sm text-gray-500">起/人</div>
        </div>
        <van-button
          type="primary"
          size="large"
          round
          class="px-8"
          @click="showBookingDialog = true"
        >
          立即预订
        </van-button>
      </div>
    </div>

    <!-- 预订对话框 -->
    <van-dialog
      v-model:show="showBookingDialog"
      title="预订确认"
      show-cancel-button
      @confirm="handleBooking"
    >
      <div class="p-6 space-y-4">
        <div class="text-center">
          <img
            :src="product?.image_url"
            :alt="product?.title"
            class="w-20 h-20 rounded-xl object-cover mx-auto mb-4"
          />
          <h3 class="font-semibold text-lg">{{ product?.title }}</h3>
          <p class="text-gray-600">{{ product?.duration }}</p>
        </div>

        <van-field
          v-model="bookingForm.date"
          label="选择日期"
          type="date"
          placeholder="请选择出行日期"
          required
        />

        <van-field
          v-model="bookingForm.guests"
          label="人数"
          type="number"
          placeholder="请输入人数"
          required
        />

        <van-field
          v-model="bookingForm.contact"
          label="联系方式"
          placeholder="请输入手机号码"
          required
        />

        <div class="bg-gray-50 rounded-xl p-4">
          <div class="flex justify-between items-center mb-2">
            <span>单价</span>
            <span>${{ product?.price }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span>人数</span>
            <span>{{ bookingForm.guests || 1 }}人</span>
          </div>
          <div class="flex justify-between items-center font-semibold text-lg">
            <span>总计</span>
            <span class="text-orange-500">${{ totalPrice }}</span>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useUserStore } from "@/store/userStore";
import { productApi } from "@/api/supabase";
import { showSuccessToast, showFailToast } from "vant";
import type { Product } from "@/types/api";

const route = useRoute();
const favoriteStore = useFavoriteStore();
const userStore = useUserStore();

// 产品数据
const product = ref<Product | null>(null);
const isLoading = ref(false);
const activeTab = ref("details");
const currentImageIndex = ref(0);

// 预订相关
const showBookingDialog = ref(false);
const bookingForm = ref({
  date: "",
  guests: 1,
  contact: "",
});

// 评价相关
interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  content: string;
  images: string[];
}
const reviews = ref<Review[]>([]);
const reviewCount = ref(0);
const loadingReviews = ref(false);
const hasMoreReviews = ref(true);

// 计算属性
const productImages = computed(() => {
  if (!product.value) return [];
  return [
    product.value.image_url,
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
  ];
});

const isFavorite = computed(() => {
  if (!product.value || !userStore.currentUser) return false;
  return favoriteStore.favorites.some(
    (fav) => fav.product_id === product.value!.id
  );
});

const originalPrice = computed(() => {
  if (!product.value || !product.value.price) return 0;
  return Math.round(product.value.price * 1.2);
});

const discount = computed(() => {
  if (!product.value || !product.value.price) return 0;
  return Math.round((1 - product.value.price / originalPrice.value) * 100);
});

const totalPrice = computed(() => {
  if (!product.value || !product.value.price || !bookingForm.value.guests)
    return product.value?.price || 0;
  return (product.value?.price || 0) * bookingForm.value.guests;
});

// 产品特色
const productFeatures = ref([
  "专业导游",
  "小团出行",
  "免费接送",
  "保险包含",
  "24小时客服",
]);

// 行程安排
const itinerary = ref([
  { time: "09:00", activity: "酒店接客，前往目的地" },
  { time: "10:30", activity: "到达景点，开始游览" },
  { time: "12:00", activity: "午餐时间（自费）" },
  { time: "14:00", activity: "继续游览，拍照留念" },
  { time: "16:00", activity: "自由活动时间" },
  { time: "18:00", activity: "返回酒店" },
]);

// 包含服务
const includedServices = ref([
  "专业导游服务",
  "景点门票",
  "交通接送",
  "旅游保险",
  "矿泉水",
  "拍照服务",
]);

// 注意事项
const importantNotes = ref([
  "请提前30分钟到达集合地点",
  "建议穿着舒适的鞋子",
  "请携带有效身份证件",
  "如遇恶劣天气，行程可能调整",
]);

// 评分分布
const ratingDistribution = ref([
  { stars: 5, count: 45, percentage: 75 },
  { stars: 4, count: 12, percentage: 20 },
  { stars: 3, count: 2, percentage: 3 },
  { stars: 2, count: 1, percentage: 2 },
  { stars: 1, count: 0, percentage: 0 },
]);

const recommendationRate = computed(() => {
  return Math.round(
    ((ratingDistribution.value[0].count + ratingDistribution.value[1].count) /
      reviewCount.value) *
      100
  );
});

// 获取产品详情
const fetchProductDetail = async () => {
  const productId = route.params.id as string;
  if (!productId) return;

  try {
    isLoading.value = true;
    const productData = await productApi.getProductById(productId);
    product.value = productData;
  } catch (error) {
    console.error("获取产品详情失败:", error);
    showFailToast("获取产品详情失败");
  } finally {
    isLoading.value = false;
  }
};

// 收藏功能
const toggleFavorite = async () => {
  if (!product.value || !userStore.currentUser) {
    showFailToast("请先登录");
    return;
  }

  try {
    await favoriteStore.toggleFavorite(product.value.id, "tours");
    showSuccessToast(isFavorite.value ? "已取消收藏" : "已添加收藏");
  } catch (error) {
    console.error("收藏操作失败:", error);
    showFailToast("操作失败，请重试");
  }
};

// 分享功能
const shareProduct = () => {
  if (navigator.share) {
    navigator.share({
      title: product.value?.title,
      text: product.value?.description,
      url: window.location.href,
    });
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href);
    showSuccessToast("链接已复制到剪贴板");
  }
};

// 预订处理
const handleBooking = async () => {
  if (
    !bookingForm.value.date ||
    !bookingForm.value.guests ||
    !bookingForm.value.contact
  ) {
    showFailToast("请填写完整信息");
    return;
  }

  try {
    // 这里应该调用预订API
    showSuccessToast("预订成功！我们会尽快联系您");
    showBookingDialog.value = false;

    // 重置表单
    bookingForm.value = {
      date: "",
      guests: 1,
      contact: "",
    };
  } catch (error) {
    console.error("预订失败:", error);
    showFailToast("预订失败，请重试");
  }
};

// 加载更多评价
const loadMoreReviews = async () => {
  // 这里应该调用API加载更多评价
  loadingReviews.value = true;
  setTimeout(() => {
    loadingReviews.value = false;
    hasMoreReviews.value = false;
  }, 1000);
};

// 轮播图切换事件
const onSwipeChange = (index: number) => {
  currentImageIndex.value = index;
};

// 标签页点击事件
const onTabClick = (tab: any) => {
  console.log("切换到标签页:", tab.name);
};

// 监听路由参数变化
watch(
  () => route.params.id,
  () => {
    fetchProductDetail();
  },
  { immediate: true }
);

// 组件挂载时加载数据
onMounted(async () => {
  await fetchProductDetail();

  // 模拟评价数据
  reviews.value = [
    {
      id: 1,
      userName: "张三",
      userAvatar: "https://picsum.photos/40/40?random=1",
      rating: 5,
      date: "2024-01-15",
      content: "非常棒的体验！导游很专业，景点很美，值得推荐！",
      images: ["https://picsum.photos/100/100?random=1"],
    },
    {
      id: 2,
      userName: "李四",
      userAvatar: "https://picsum.photos/40/40?random=2",
      rating: 4,
      date: "2024-01-10",
      content: "整体不错，就是午餐时间有点紧，其他都很好。",
      images: [],
    },
  ];

  reviewCount.value = 60;
});
</script>

<style scoped>
.van-swipe {
  height: 20rem;
}
</style>
