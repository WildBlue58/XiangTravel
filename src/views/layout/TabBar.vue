<template>
  <van-tabbar v-model="active" class="bg-white border-t border-gray-200">
    <van-tabbar-item icon="home-o" to="/home" name="home">
      <span class="text-xs mt-1">Home</span>
    </van-tabbar-item>
    <van-tabbar-item icon="discount" to="/discount" name="discount">
      <span class="text-xs mt-1">Discount</span>
    </van-tabbar-item>
    <van-tabbar-item icon="star-o" to="/collection" name="collection">
      <span class="text-xs mt-1">Favorites</span>
    </van-tabbar-item>
    <van-tabbar-item icon="calendar-o" to="/trip" name="trip">
      <span class="text-xs mt-1">Itinerary</span>
    </van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/account" name="account">
      <span class="text-xs mt-1">My Profile</span>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref } from "vue";

const active = ref<string>("home");
</script>

<style scoped>
.van-tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.van-tabbar-item__icon {
  margin-bottom: 4px;
}

.van-tabbar-item--active {
  color: #f97316;
}

.van-tabbar-item--active .van-icon {
  color: #f97316;
}
</style>
