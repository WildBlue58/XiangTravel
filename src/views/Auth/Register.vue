<template>
  <div
    class="register min-h-screen bg-gray-50 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <van-icon name="location-o" size="2.5rem" color="white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">创建账户</h1>
        <p class="text-gray-600 mt-2">开始您的旅行之旅</p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <van-form @submit="handleRegister">
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              name="name"
              label="姓名"
              placeholder="请输入您的姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              type="email"
              :rules="[
                { required: true, message: '请输入邮箱' },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '请输入有效的邮箱地址',
                },
              ]"
            />
            <van-field
              v-model="form.password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              :rules="[
                { required: true, message: '请输入密码' },
                { validator: validatePassword, message: '密码至少6位' },
              ]"
            />
            <van-field
              v-model="form.confirmPassword"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              type="password"
              :rules="[
                { required: true, message: '请确认密码' },
                {
                  validator: validateConfirmPassword,
                  message: '两次密码输入不一致',
                },
              ]"
            />
          </van-cell-group>

          <!-- 服务条款 -->
          <div class="mt-6">
            <van-checkbox v-model="agreeTerms" class="text-sm">
              我已阅读并同意
              <button type="button" class="text-orange-500 hover:underline">
                服务条款
              </button>
              和
              <button type="button" class="text-orange-500 hover:underline">
                隐私政策
              </button>
            </van-checkbox>
          </div>

          <!-- 注册按钮 -->
          <div class="mt-8">
            <van-button
              type="primary"
              size="large"
              round
              block
              native-type="submit"
              :loading="isLoading"
              loading-text="注册中..."
              :disabled="!agreeTerms"
            >
              创建账户
            </van-button>
          </div>
        </van-form>

        <!-- 分割线 -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-gray-500 text-sm">或</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- 登录链接 -->
        <div class="text-center">
          <span class="text-gray-600">已有账户？</span>
          <button
            type="button"
            class="text-orange-500 font-medium hover:underline ml-1"
            @click="goToLogin"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { userApi } from "@/api/supabase";
import { showSuccessToast, showFailToast } from "vant";

const router = useRouter();

const isLoading = ref(false);
const agreeTerms = ref(false);
const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// 验证密码长度
const validatePassword = (value: string) => {
  return value.length >= 6;
};

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === form.value.password;
};

// 注册处理
const handleRegister = async () => {
  if (!agreeTerms.value) {
    showFailToast("请先同意服务条款和隐私政策");
    return;
  }

  try {
    isLoading.value = true;

    const { user, error } = await userApi.signUp(
      form.value.email,
      form.value.password,
      form.value.name
    );

    if (error) {
      showFailToast(error.message || "注册失败");
      return;
    }

    if (user) {
      showSuccessToast("注册成功！请查收邮箱验证邮件");
      router.push("/login");
    }
  } catch (error) {
    console.error("注册失败:", error);
    showFailToast("注册失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.van-cell-group {
  margin: 0;
}
</style>
