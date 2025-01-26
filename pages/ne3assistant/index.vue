<template>
  <div class="flex flex-col space-y-2 p-4 h-full justify-between">
    <div class="flex flex-col space-y-4">
      <h1 class="font-semibold text-2xl">Ne3 Assistent</h1>
      <span>Bitte wählen Sie einen laufenden Auftrag aus: </span>
      <div class="flex flex-col space-y-4 justify-center items-center px-10">
        <template v-if="orders.length === 0">
          <span>Keine Laufende Aufträge verfügbar</span>
        </template>
        <template v-else v-for="order in orders">
          <OrderCardSelection
            @selected="selectedOrder = $event"
            :order="order"
            :selectedOrder="selectedOrder"
          />
        </template>
      </div>
    </div>
    <button
      class="w-full h-12 flex justify-center items-center text-lg font-bold text-white rounded-md transition min-h-10"
      :disabled="selectedOrder === null"
      :class="{
        'bg-blue-500 hover:bg-blue-600 hover:scale-105': selectedOrder !== null,
        'bg-gray-400': selectedOrder === null,
      }"
      @click="handleStart"
    >
      Ne3 Assistent starten
    </button>
  </div>
</template>

<script setup lang="ts">
import type { OrderResponse, Order } from "~/types";

const token = useCookie("jwt").value;
const router = useRouter();

const selectedOrder = ref<number | null>(null);

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

function handleStart() {
  console.log("Start", selectedOrder.value);
  router.push(`/ne3assistant/order/${selectedOrder.value}`);
}
</script>
