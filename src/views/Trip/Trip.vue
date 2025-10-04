<template>
  <div class="trip min-h-screen bg-gray-50">
    <!-- 顶部渐变背景 -->
    <div
      class="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500 to-white -z-10"
    ></div>

    <!-- 标题栏 -->
    <div class="px-4 pt-6 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">Itinerary</h1>
    </div>

    <!-- 主要内容 -->
    <main class="px-4 pb-20">
      <!-- Upcoming 部分 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">Upcoming</h2>
        <div class="space-y-4">
          <div
            v-for="trip in upcomingTrips"
            :key="trip.id"
            class="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <img
                :src="trip.imageUrl"
                :alt="trip.title"
                class="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 class="font-semibold text-lg text-gray-900">
                  {{ trip.title }}
                </h3>
                <p class="text-base text-gray-600">{{ trip.dates }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <van-icon
                name="delete-o"
                size="1.2rem"
                color="#ef4444"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                @click="deleteTrip(trip.id)"
              />
              <van-icon name="arrow" size="1.2rem" color="#9ca3af" />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="upcomingTrips.length === 0" class="text-center py-8">
            <van-icon name="calendar-o" size="3rem" color="#d1d5db" />
            <p class="text-gray-500 mt-4">暂无即将到来的行程</p>
            <p class="text-sm text-gray-400 mt-2">点击右下角按钮添加新行程</p>
          </div>
        </div>
      </div>

      <!-- Past 部分 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">Past</h2>
        <div class="space-y-4">
          <div
            v-for="trip in pastTrips"
            :key="trip.id"
            class="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <img
                :src="trip.imageUrl"
                :alt="trip.title"
                class="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 class="font-semibold text-lg text-gray-900">
                  {{ trip.title }}
                </h3>
                <p class="text-base text-gray-600">{{ trip.dates }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <van-icon
                name="delete-o"
                size="1.2rem"
                color="#ef4444"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                @click="deleteTrip(trip.id)"
              />
              <van-icon name="arrow" size="1.2rem" color="#9ca3af" />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="pastTrips.length === 0" class="text-center py-8">
            <van-icon name="clock-o" size="3rem" color="#d1d5db" />
            <p class="text-gray-500 mt-4">暂无过去的行程</p>
            <p class="text-sm text-gray-400 mt-2">完成行程后会自动移到这里</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 浮动添加按钮 -->
    <div class="fixed bottom-24 right-4">
      <van-button
        type="primary"
        round
        size="large"
        class="w-16 h-16 shadow-lg"
        @click="showAddTripDialog = true"
      >
        <van-icon name="plus" size="1.8rem" />
      </van-button>
    </div>

    <!-- 添加行程对话框 -->
    <van-dialog
      v-model:show="showAddTripDialog"
      title="添加新行程"
      show-cancel-button
      @confirm="addTrip"
    >
      <div class="p-6 space-y-4">
        <van-field
          v-model="newTripForm.title"
          label="行程标题"
          placeholder="请输入行程标题"
          required
        />
        <van-field
          v-model="newTripForm.description"
          label="行程描述"
          placeholder="请输入行程描述"
          type="textarea"
        />
        <van-field
          v-model="newTripForm.startDate"
          label="开始日期"
          type="date"
          required
        />
        <van-field
          v-model="newTripForm.endDate"
          label="结束日期"
          type="date"
          required
        />
        <van-field
          v-model="newTripForm.imageUrl"
          label="图片链接"
          placeholder="请输入图片链接（可选）"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTripStore } from "@/store/tripStore";
import { useUserStore } from "@/store/userStore";
import type { TripCard } from "@/types/api";

const tripStore = useTripStore();
const userStore = useUserStore();

// 计算属性 - 行程数据
const upcomingTrips = computed<TripCard[]>(() => {
  return tripStore.upcomingTripCards;
});

const pastTrips = computed<TripCard[]>(() => {
  return tripStore.pastTripCards;
});

// 添加新行程
const showAddTripDialog = ref(false);
const newTripForm = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  imageUrl: "",
});

const addTrip = async () => {
  if (
    !newTripForm.value.title ||
    !newTripForm.value.startDate ||
    !newTripForm.value.endDate
  ) {
    return;
  }

  try {
    await tripStore.createTrip({
      title: newTripForm.value.title,
      description: newTripForm.value.description,
      start_date: newTripForm.value.startDate,
      end_date: newTripForm.value.endDate,
      image_url: newTripForm.value.imageUrl,
    });

    // 重置表单
    newTripForm.value = {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      imageUrl: "",
    };
    showAddTripDialog.value = false;
  } catch (error) {
    console.error("添加行程失败:", error);
  }
};

// 删除行程
const deleteTrip = async (tripId: string) => {
  try {
    await tripStore.deleteTrip(tripId);
  } catch (error) {
    console.error("删除行程失败:", error);
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  if (userStore.currentUser) {
    await tripStore.fetchUserTrips();
  }
});
</script>
