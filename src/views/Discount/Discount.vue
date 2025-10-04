<template>
  <div class="discount min-h-screen bg-gray-50">
    <!-- 顶部渐变背景 -->
    <div
      class="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500 to-white -z-10"
    ></div>

    <!-- 搜索栏 -->
    <div class="px-4 pt-6 pb-4">
      <van-search
        v-model="searchField"
        placeholder="Q Where"
        show-action
        shape="round"
        background="transparent"
        class="mb-6"
      >
        <template #action>
          <div class="text-white">
            <van-icon name="shopping-cart-o" size="1.25rem" />
          </div>
        </template>
      </van-search>
    </div>

    <!-- 主要内容 -->
    <main class="px-4 pb-20">
      <!-- 标签页 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <van-tabs v-model:active="activeTab" class="mb-0">
          <van-tab title="Tours & tickets" name="tours"></van-tab>
          <van-tab title="Hotels" name="hotels"></van-tab>
          <van-tab title="Car rentals" name="cars"></van-tab>
        </van-tabs>
      </div>

      <!-- Deals 部分 -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">Deals</h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="deal in deals"
            :key="deal.id"
            class="bg-gray-50 rounded-xl overflow-hidden"
          >
            <img
              :src="deal.imageUrl"
              :alt="deal.title"
              class="w-full h-28 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-base text-gray-900">
                {{ deal.title }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ deal.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular destinations 部分 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-6 text-gray-900">
          Popular destinations
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="destination in popularDestinations"
            :key="destination.id"
            class="bg-gray-50 rounded-xl overflow-hidden"
          >
            <img
              :src="destination.imageUrl"
              :alt="destination.name"
              class="w-full h-24 object-cover"
            />
            <div class="p-3">
              <h3 class="font-semibold text-sm text-center text-gray-900">
                {{ destination.name }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const searchField = ref<string>("");
const activeTab = ref("tours");

// Deals 数据
const deals = ref([
  {
    id: 1,
    title: "Explore the Alps",
    description: "Hiking and sightseeing",
    imageUrl:
      "https://images.pexels.com/photos/773594/pexels-photo-773594.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Discover Tokyo",
    description: "Cultural tours and",
    imageUrl:
      "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
]);

// 热门目的地数据
const popularDestinations = ref([
  {
    id: 1,
    name: "Paris",
    imageUrl:
      "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Rome",
    imageUrl:
      "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Barcelona",
    imageUrl:
      "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "London",
    imageUrl:
      "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
]);
</script>
