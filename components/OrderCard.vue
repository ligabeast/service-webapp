<template>
  <NuxtLink
    :to="{
      path:
        order.status === 'started' ? '/postOrder' : `/orderDetails/${order.id}`,
      query:
        order.status === 'started'
          ? {
              ordernumber: order.ordernumber,
              kls_id: order.kls_id,
              adress: order.adress,
              orderid: order.id,
              currentPage: props.currentPage, // Falls benötigt
            }
          : {
              currentPage: props.currentPage, // Falls nur `currentPage` benötigt wird
            },
    }"
  >
    <button
      class="border border-black rounded-sm flex justify-between p-4 w-full h-28 space-x-3 hover:bg-gray-300 hover:scale-105 transition"
    >
      <div class="h-full w-full flex flex-col space-y-2 text-left">
        <div class="whitespace-pre-wrap" v-html="order.adress"></div>
        <span
          :class="{
            'text-yellow-500': order.status === 'started',
            'text-green-500': order.status === 'completed',
          }"
        >
          {{ order.status }}
        </span>
      </div>
      <span>{{ timeFormatter.format(new Date(order.dateCreated)) }}</span>
    </button>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Order } from "~/types";

const props = defineProps<{
  order: Order;
  currentPage: number;
}>();

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
