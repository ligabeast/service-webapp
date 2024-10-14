<template>
  <div class="flex w-full h-full flex-col space-y-4 p-4">
    <h1 class="font-semibold text-2xl">Meine letzten Aufträge</h1>
    <template v-for="order in orders">
      <OrderCard :order="order" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { OrderResponse } from "~/types";

const { data, error } = await useFetch<OrderResponse>("/api/getMyOrders", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});
console.log(data.value);

const orders = ref(data.value?.data);
</script>
