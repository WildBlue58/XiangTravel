<template>
  <div class="account min-h-screen bg-gray-50">
    <!-- 顶部渐变背景 -->
    <div
      class="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500 to-white -z-10"
    ></div>

    <!-- 标题栏 -->
    <div class="px-4 pt-6 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">My Profile</h1>
    </div>

    <!-- 主要内容 -->
    <main class="px-4 pb-20">
      <!-- 用户资料卡片 -->
      <div class="bg-white rounded-2xl p-8 mb-6 shadow-sm">
        <div class="flex items-center space-x-6">
          <div
            class="avatar-container relative cursor-pointer"
            @click="handleAvatarUpload"
          >
            <img
              :src="userProfile.avatarUrl"
              :alt="userProfile.name"
              class="w-20 h-20 rounded-full object-cover transition-opacity"
              :class="{ 'opacity-50': isUploading }"
            />
            <div
              class="avatar-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              v-if="!isUploading"
            >
              <van-icon name="camera-o" size="20" color="#fff" />
            </div>
            <div
              class="avatar-loading absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full"
              v-if="isUploading"
            >
              <van-loading type="spinner" size="20" color="#fff" />
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ userProfile.name }}
            </h2>
            <p class="text-orange-500 font-semibold text-lg mt-1">
              {{ userProfile.memberType }}
            </p>
            <p class="text-base text-gray-600 mt-1">
              {{ userProfile.joinDate }}
            </p>
          </div>
        </div>
      </div>

      <!-- Account 部分 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-xl font-bold mb-6 text-gray-900">Account</h3>
        <div class="space-y-2">
          <div
            v-for="option in accountOptions"
            :key="option.id"
            class="flex items-center justify-between p-5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <van-icon :name="option.icon" size="1.5rem" color="#6b7280" />
              <span class="font-semibold text-lg text-gray-900">{{
                option.title
              }}</span>
            </div>
            <van-icon name="arrow" size="1.2rem" color="#9ca3af" />
          </div>

          <!-- 登出按钮 -->
          <div
            class="flex items-center justify-between p-5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            @click="handleLogout"
          >
            <div class="flex items-center space-x-4">
              <van-icon name="logout" size="1.5rem" color="#ef4444" />
              <span class="font-semibold text-lg text-red-500">登出</span>
            </div>
            <van-icon name="arrow" size="1.2rem" color="#ef4444" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useTripStore } from "@/store/tripStore";
import { avatarApi } from "@/api/supabase";
import { showSuccessToast, showFailToast, showLoadingToast } from "vant";

const userStore = useUserStore();
const favoriteStore = useFavoriteStore();
const tripStore = useTripStore();

// 头像上传相关状态
const isUploading = ref(false);

// 计算属性 - 用户资料
const userProfile = computed(() => {
  return (
    userStore.userProfile || {
      name: "Guest User",
      memberType: "Basic Member",
      joinDate: "Not logged in",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    }
  );
});

// 账户选项
const accountOptions = ref([
  { id: 1, title: "Personal Information", icon: "user-o" },
  { id: 2, title: "Order History", icon: "orders-o" },
  { id: 3, title: "Payment Methods", icon: "credit-pay" },
  { id: 4, title: "Notifications", icon: "volume-o" },
  { id: 5, title: "Settings", icon: "setting-o" },
]);

// 头像上传功能
const handleAvatarUpload = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 验证文件大小 (最大5MB)
    if (file.size > 5 * 1024 * 1024) {
      showFailToast("图片大小不能超过5MB");
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      showFailToast("请选择图片文件");
      return;
    }

    try {
      isUploading.value = true;
      showLoadingToast({
        message: "正在上传头像...",
        forbidClick: true,
        duration: 0,
      });

      const userId = userStore.currentUser?.id;
      if (!userId) {
        showFailToast("用户未登录");
        return;
      }

      const avatarUrl = await avatarApi.updateUserAvatar(userId, file);

      // 更新用户store中的头像
      await userStore.updateUserProfile({ avatarUrl });

      showSuccessToast("头像上传成功");
    } catch (error) {
      console.error("头像上传失败:", error);
      showFailToast("头像上传失败，请重试");
    } finally {
      isUploading.value = false;
    }
  };
  input.click();
};

// 登出功能
const handleLogout = async () => {
  try {
    await userStore.logout();
    // 重定向到登录页
    window.location.href = "/login";
  } catch (error) {
    console.error("登出失败:", error);
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  await userStore.fetchCurrentUser();
  if (userStore.currentUser) {
    await favoriteStore.fetchUserFavorites();
    await tripStore.fetchUserTrips();
  }
});
</script>
