import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, UserProfile } from "@/types/api";
import { userApi } from "@/api/supabase";

export const useUserStore = defineStore("user", () => {
  // 状态
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const userProfile = computed<UserProfile | null>(() => {
    if (!currentUser.value) return null;

    return {
      name: currentUser.value.name,
      memberType: currentUser.value.member_type,
      joinDate: `Joined in ${new Date(
        currentUser.value.join_date
      ).getFullYear()}`,
      avatarUrl: currentUser.value.avatar_url,
    };
  });

  const isLoggedIn = computed(() => !!currentUser.value);

  // 方法
  const fetchCurrentUser = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const user = await userApi.getCurrentUser();
      currentUser.value = user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取用户信息失败";
      console.error("获取用户信息失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await userApi.updateProfile(
        currentUser.value.id,
        updates
      );
      currentUser.value = updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新用户信息失败";
      console.error("更新用户信息失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { user, error: authError } = await userApi.signIn(email, password);

      if (authError) {
        error.value = authError.message;
        return false;
      }

      if (user) {
        await fetchCurrentUser();
        return true;
      }

      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "登录失败";
      console.error("登录失败:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { user, error: authError } = await userApi.signUp(
        email,
        password,
        name
      );

      if (authError) {
        error.value = authError.message;
        return false;
      }

      return !!user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "注册失败";
      console.error("注册失败:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await userApi.signOut();
      currentUser.value = null;
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "登出失败";
      console.error("登出失败:", err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const { error: authError } = await userApi.resetPassword(email);

      if (authError) {
        error.value = authError.message;
        return false;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "重置密码失败";
      console.error("重置密码失败:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户资料（用于头像更新）
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser.value) return;

    try {
      // 更新本地状态
      currentUser.value = {
        ...currentUser.value,
        ...updates,
      };
    } catch (error) {
      console.error("更新用户资料失败:", error);
      throw error;
    }
  };

  return {
    // 状态
    currentUser,
    isLoading,
    error,

    // 计算属性
    userProfile,
    isLoggedIn,

    // 方法
    fetchCurrentUser,
    updateProfile,
    updateUserProfile,
    login,
    register,
    logout,
    resetPassword,
  };
});
