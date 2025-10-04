<template>
  <div
    class="login min-h-screen bg-gray-50 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <van-icon name="location-o" size="2.5rem" color="white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">欢迎回来</h1>
        <p class="text-gray-600 mt-2">登录您的账户继续旅行</p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <van-form @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              type="email"
              :rules="[{ required: true, message: '请输入邮箱' }]"
            />
            <van-field
              v-model="form.password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
          </van-cell-group>

          <!-- 忘记密码 -->
          <div class="text-right mt-4">
            <button
              type="button"
              class="text-orange-500 text-sm hover:underline"
              @click="handleForgotPassword"
            >
              忘记密码？
            </button>
          </div>

          <!-- 登录按钮 -->
          <div class="mt-8">
            <van-button
              type="primary"
              size="large"
              round
              block
              native-type="submit"
              :loading="isLoading"
              loading-text="登录中..."
            >
              登录
            </van-button>
          </div>
        </van-form>

        <!-- 分割线 -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-gray-500 text-sm">或</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- 注册链接 -->
        <div class="text-center">
          <span class="text-gray-600">还没有账户？</span>
          <button
            type="button"
            class="text-orange-500 font-medium hover:underline ml-1"
            @click="goToRegister"
          >
            立即注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { userApi } from "@/api/supabase";
import { showToast, showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const form = ref({
  email: "",
  password: "",
});

// 登录处理
const handleLogin = async () => {
  try {
    isLoading.value = true;

    const { user, error } = await userApi.signIn(
      form.value.email,
      form.value.password
    );

    if (error) {
      showFailToast(error.message || "登录失败");
      return;
    }

    if (user) {
      // 获取用户信息
      await userStore.fetchCurrentUser();
      showSuccessToast("登录成功");
      router.push("/home");
    }
  } catch (error) {
    console.error("登录失败:", error);
    showFailToast("登录失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

// 忘记密码
const handleForgotPassword = async () => {
  if (!form.value.email) {
    showFailToast("请先输入邮箱");
    return;
  }

  try {
    const { error } = await userApi.resetPassword(form.value.email);

    if (error) {
      showFailToast(error.message || "发送重置邮件失败");
      return;
    }

    showSuccessToast("重置邮件已发送，请查收邮箱");
  } catch (error) {
    console.error("发送重置邮件失败:", error);
    showFailToast("发送重置邮件失败，请重试");
  }
};

// 跳转到注册页面
const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.van-cell-group {
  margin: 0;
}
</style>
