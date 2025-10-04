// API 响应类型定义
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  member_type: "Basic" | "Gold" | "Premium";
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  name: string;
  memberType: string;
  joinDate: string;
  avatarUrl?: string;
}

// 产品相关类型
export interface Product {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  price?: number;
  category: "tours" | "hotels" | "transportation" | "tickets" | "cars";
  location?: string;
  duration?: string;
  rating?: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  duration?: string;
  rating?: number;
}

// 收藏相关类型
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  category: string;
  created_at: string;
  product?: Product;
}

// 行程相关类型
export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "past" | "cancelled";
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TripCard {
  id: string;
  title: string;
  dates: string;
  imageUrl: string;
  status: "upcoming" | "past";
}

// 搜索相关类型
export interface SearchHistory {
  id: string;
  user_id?: string;
  query: string;
  category?: string;
  created_at: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// 探索功能类型
export interface ExploreItem {
  title: string;
  icon: string;
  category: string;
}

// 最近浏览类型
export interface RecentlyViewed {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  viewed_at: string;
}

// API 请求参数类型
export interface SearchParams {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: "price" | "rating" | "created_at" | "price_desc";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  categories?: string[];
}

export interface FavoriteParams {
  product_id: string;
  category?: string;
}

export interface TripParams {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  image_url?: string;
}
