import { createClient } from "@supabase/supabase-js";
import type {
  User,
  Product,
  Favorite,
  Trip,
  SearchHistory,
  SearchResult,
  SearchParams,
  FavoriteParams,
  TripParams,
} from "@/types/api";

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 开发环境下的备用配置（仅用于开发，生产环境必须使用环境变量）
const isDevelopment = import.meta.env.DEV;
const fallbackUrl = isDevelopment
  ? "https://qthpqrywzuhrlcfoaqhr.supabase.co"
  : "";
const fallbackKey = isDevelopment
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aHBxcnl3enVocmxjZm9hcWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzAwNjIsImV4cCI6MjA3NTA0NjA2Mn0.hxlbtNJQ1N4l4JBJDh0YS0g2VItkPGem672e5uLYEYE"
  : "";

const finalUrl = supabaseUrl || fallbackUrl;
const finalKey = supabaseKey || fallbackKey;

if (!finalUrl || !finalKey) {
  console.error("❌ 环境变量未找到！请检查 .env.local 文件");
  console.error("📝 请确保 .env.local 文件包含：");
  console.error("VITE_SUPABASE_URL=你的_supabase_url");
  console.error("VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(finalUrl, finalKey);

// 用户相关 API
export const userApi = {
  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    return data;
  },

  // 更新用户资料
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 注册用户
  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: any; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (data.user && !error) {
      // 创建用户资料
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        name,
        member_type: "Basic",
      });

      if (insertError) {
        console.error("创建用户资料失败:", insertError);
      }
    }

    return { user: data.user, error };
  },

  // 登录用户
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: any; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  },

  // 登出用户
  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 重置密码
  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  // 更新密码
  async updatePassword(password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  },
};

// 产品相关 API
export const productApi = {
  // 搜索产品
  async searchProducts(params: SearchParams): Promise<SearchResult> {
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (params.query) {
      query = query.or(
        `title.ilike.%${params.query}%,description.ilike.%${params.query}%`
      );
    }

    if (params.category) {
      query = query.eq("category", params.category);
    }

    // 价格范围筛选
    if (params.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }

    // 评分筛选
    if (params.minRating !== undefined) {
      query = query.gte("rating", params.minRating);
    }

    // 分类筛选
    if (params.categories && params.categories.length > 0) {
      query = query.in("category", params.categories);
    }

    // 排序
    if (params.sort) {
      if (params.sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else {
        const ascending =
          params.sort === "price" || params.sort === "created_at";
        query = query.order(params.sort, { ascending });
      }
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  // 获取推荐产品
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  },

  // 获取产品详情
  async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};

// 收藏相关 API
export const favoriteApi = {
  // 获取用户收藏
  async getUserFavorites(
    userId: string,
    category?: string
  ): Promise<Favorite[]> {
    let query = supabase
      .from("favorites")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("user_id", userId);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  },

  // 添加收藏
  async addFavorite(userId: string, params: FavoriteParams): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: userId,
        product_id: params.product_id,
        category: params.category || "tours",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除收藏
  async removeFavorite(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
  },

  // 检查是否已收藏
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    return !error && !!data;
  },
};

// 行程相关 API
export const tripApi = {
  // 获取用户行程
  async getUserTrips(
    userId: string,
    status?: "upcoming" | "past"
  ): Promise<Trip[]> {
    let query = supabase.from("trips").select("*").eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("start_date", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  },

  // 创建行程
  async createTrip(userId: string, params: TripParams): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        ...params,
        status: "upcoming",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新行程
  async updateTrip(
    tripId: string,
    updates: Partial<TripParams>
  ): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除行程
  async deleteTrip(tripId: string): Promise<void> {
    const { error } = await supabase.from("trips").delete().eq("id", tripId);

    if (error) throw error;
  },
};

// 搜索历史相关 API
export const searchApi = {
  // 保存搜索历史
  async saveSearchHistory(
    userId: string | null,
    query: string,
    category?: string
  ): Promise<void> {
    const { error } = await supabase.from("search_history").insert({
      user_id: userId,
      query,
      category,
    });

    if (error) throw error;
  },

  // 获取搜索历史
  async getSearchHistory(
    userId: string,
    limit: number = 10
  ): Promise<SearchHistory[]> {
    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // 清除搜索历史
  async clearSearchHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from("search_history")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },
};

// 头像上传相关 API
export const avatarApi = {
  // 上传头像
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // 生成唯一文件名
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // 上传文件到Supabase Storage
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // 如果文件已存在则覆盖
      });

    if (error) throw error;

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  // 更新用户头像URL
  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) throw error;
  },

  // 删除旧头像
  async deleteOldAvatar(userId: string): Promise<void> {
    const { error } = await supabase.storage
      .from("avatars")
      .remove([
        `${userId}/avatar.jpg`,
        `${userId}/avatar.png`,
        `${userId}/avatar.jpeg`,
      ]);

    if (error) throw error;
  },

  // 完整的头像更新流程
  async updateUserAvatar(userId: string, file: File): Promise<string> {
    try {
      // 1. 删除旧头像
      await this.deleteOldAvatar(userId);

      // 2. 上传新头像
      const avatarUrl = await this.uploadAvatar(userId, file);

      // 3. 更新用户表中的头像URL
      await this.updateAvatarUrl(userId, avatarUrl);

      return avatarUrl;
    } catch (error) {
      console.error("头像更新失败:", error);
      throw error;
    }
  },
};
