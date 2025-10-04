import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Trip, TripCard, TripParams } from "@/types/api";
import { tripApi } from "@/api/supabase";
import { useUserStore } from "./userStore";

export const useTripStore = defineStore("trip", () => {
  // 状态
  const trips = ref<Trip[]>([]);
  const upcomingTrips = ref<Trip[]>([]);
  const pastTrips = ref<Trip[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const tripCards = computed<TripCard[]>(() => {
    return trips.value.map((trip) => ({
      id: trip.id,
      title: trip.title,
      dates: `${trip.start_date} - ${trip.end_date}`,
      imageUrl: trip.image_url || "",
      status: trip.status as "upcoming" | "past",
    }));
  });

  const upcomingTripCards = computed<TripCard[]>(() => {
    return upcomingTrips.value.map((trip) => ({
      id: trip.id,
      title: trip.title,
      dates: `${trip.start_date} - ${trip.end_date}`,
      imageUrl: trip.image_url || "",
      status: "upcoming" as const,
    }));
  });

  const pastTripCards = computed<TripCard[]>(() => {
    return pastTrips.value.map((trip) => ({
      id: trip.id,
      title: trip.title,
      dates: `${trip.start_date} - ${trip.end_date}`,
      imageUrl: trip.image_url || "",
      status: "past" as const,
    }));
  });

  const tripCount = computed(() => trips.value.length);

  // 方法
  const fetchUserTrips = async (status?: "upcoming" | "past") => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      isLoading.value = true;
      error.value = null;

      const userTrips = await tripApi.getUserTrips(
        userStore.currentUser.id,
        status
      );

      if (status === "upcoming") {
        upcomingTrips.value = userTrips;
      } else if (status === "past") {
        pastTrips.value = userTrips;
      } else {
        trips.value = userTrips;
        // 自动分类
        upcomingTrips.value = userTrips.filter(
          (trip) => trip.status === "upcoming"
        );
        pastTrips.value = userTrips.filter((trip) => trip.status === "past");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取行程列表失败";
      console.error("获取行程列表失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const createTrip = async (params: TripParams) => {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      isLoading.value = true;
      error.value = null;

      const newTrip = await tripApi.createTrip(
        userStore.currentUser.id,
        params
      );

      trips.value.push(newTrip);
      upcomingTrips.value.push(newTrip);

      return newTrip;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建行程失败";
      console.error("创建行程失败:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<TripParams>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTrip = await tripApi.updateTrip(tripId, updates);

      // 更新本地状态
      const index = trips.value.findIndex((trip) => trip.id === tripId);
      if (index !== -1) {
        trips.value[index] = updatedTrip;
      }

      // 更新分类列表
      const upcomingIndex = upcomingTrips.value.findIndex(
        (trip) => trip.id === tripId
      );
      if (upcomingIndex !== -1) {
        upcomingTrips.value[upcomingIndex] = updatedTrip;
      }

      const pastIndex = pastTrips.value.findIndex((trip) => trip.id === tripId);
      if (pastIndex !== -1) {
        pastTrips.value[pastIndex] = updatedTrip;
      }

      return updatedTrip;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新行程失败";
      console.error("更新行程失败:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      await tripApi.deleteTrip(tripId);

      // 从本地状态中移除
      trips.value = trips.value.filter((trip) => trip.id !== tripId);
      upcomingTrips.value = upcomingTrips.value.filter(
        (trip) => trip.id !== tripId
      );
      pastTrips.value = pastTrips.value.filter((trip) => trip.id !== tripId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除行程失败";
      console.error("删除行程失败:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearTrips = () => {
    trips.value = [];
    upcomingTrips.value = [];
    pastTrips.value = [];
    error.value = null;
  };

  return {
    // 状态
    trips,
    upcomingTrips,
    pastTrips,
    isLoading,
    error,

    // 计算属性
    tripCards,
    upcomingTripCards,
    pastTripCards,
    tripCount,

    // 方法
    fetchUserTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    clearTrips,
  };
});
