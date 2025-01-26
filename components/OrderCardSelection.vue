<template>
  <div
    class="rounded-sm flex justify-between p-4 w-full h-28 space-x-3 hover:bg-gray-300 hover:scale-105 transition"
    @click="$emit('selected', props.order.id)"
    :class="{
      'bg-gray-100 border-blue-500 border-2': selectedOrder == order.id,
      'border-black border ': selectedOrder != order.id,
    }"
  >
    <div class="h-full w-full flex flex-col space-y-2 text-left">
      <div class="whitespace-pre-wrap" v-html="order.adress"></div>
      <span
        class="overflow-hidden"
        :class="{
          'text-yellow-500': order.status === 'started',
          'text-green-500':
            order.status === 'completed' && !order.notCompletedReason,
          'text-red-500':
            order.status === 'completed' && order.notCompletedReason,
        }"
      >
        {{
          order.status === "completed" && order.notCompletedReason
            ? "nicht erledigt - " + order.notCompletedReason
            : order.status
        }}
      </span>
    </div>
    <span>{{ timeFormatter.format(new Date(order.dateCreated)) }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Order } from "~/types";

const props = defineProps<{
  order: Order;
  selectedOrder: number | null;
}>();

console.log("OrderCard", props.order);

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  year: "numeric",
  month: "2-digit",
  minute: "2-digit",
  hour: "2-digit",
});

function handleModifyOrder() {
  console.log("Modify order", props.order);
}
</script>
