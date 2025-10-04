import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "@/store/userStore";
// 路由配置数组？
const rootRoutes: RouteRecordRaw[] = [
  {
    path: "/home",
    //懒加载
    component: () => import("@/views/HomePage/HomePage.vue"),
    name: "home",
  },
  {
    path: "/account",
    name: "account",
    component: () => import("@/views/Account/Account.vue"),
  },
  {
    path: "/discount",
    name: "discount",
    component: () => import("@/views/Discount/Discount.vue"),
  },
  {
    path: "/collection",
    name: "collection",
    component: () => import("@/views/Collection/Collection.vue"),
  },
  {
    path: "/trip",
    name: "trip",
    component: () => import("@/views/Trip/Trip.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/Search/SearchResults.vue"),
  },
  {
    path: "/product/:id",
    name: "product-detail",
    component: () => import("@/views/Product/ProductDetail.vue"),
  },
];

// 认证路由
const authRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Auth/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Auth/Register.vue"),
  },
];
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "App",
    component: () => import("@/views/TheRoot.vue"),
    redirect: "/home",
    children: rootRoutes,
  },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();

  // 需要认证的页面
  const protectedRoutes = ["/account", "/collection", "/trip"];

  // 如果访问的是受保护的页面
  if (protectedRoutes.includes(to.path)) {
    // 检查用户是否已登录
    if (!userStore.isLoggedIn) {
      // 尝试获取用户信息
      await userStore.fetchCurrentUser();

      if (!userStore.isLoggedIn) {
        // 未登录，重定向到登录页
        next("/login");
        return;
      }
    }
  }

  // 如果已登录用户访问认证页面，重定向到首页
  if (
    (to.path === "/login" || to.path === "/register") &&
    userStore.isLoggedIn
  ) {
    next("/home");
    return;
  }

  next();
});

export default router;
