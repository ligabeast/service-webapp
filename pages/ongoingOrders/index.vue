<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <h1 class="text-2xl font-semibold">Laufende Aufträge</h1>
    <template v-for="order in orders">
      <OrderCard :order="order" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderResponse } from "~/types";
const token = useCookie("jwt").value;

const { data, error } = await useFetch<OrderResponse>(
  "/api/getAllOngoingOrders",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
if (!data.value) {
  console.error(error);
}
const orders = ref<Order[]>(
  data.value && data.value.status === "success"
    ? (data.value.data as Order[])
    : []
);
</script>
