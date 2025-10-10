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
              orderType: order.orderType,
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
      <div class="flex flex-col items-center justify-between">
        <div
          class="flex justify-center items-center space-x-2"
          @click.prevent.stop
        >
          <span class="text-sm text-blue-500 font-bold">{{
            order.orderType
          }}</span>
          <button
            class="rounded border transition p-1 h-8 w-8"
            :class="{
              'hover:bg-gray-300 border-gray-400 ': !observeOrder,
              'bg-white border-yellow-500 ': observeOrder,
            }"
            @click="handleObserveOrder(order.id)"
          >
            <svg
              class="w-full h-full"
              :class="{
                'text-gray-400': !observeOrder,
                'text-yellow-500 ': observeOrder,
              }"
              viewBox="-1 0 19 19"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m12.673 10.779.798 4.02c.221 1.11-.407 1.566-1.395 1.013L8.5 13.81l-3.576 2.002c-.988.553-1.616.097-1.395-1.013l.397-2.001.401-2.02-1.51-1.397-1.498-1.385c-.832-.769-.592-1.507.532-1.64l2.026-.24 2.044-.242 1.717-3.722c.474-1.028 1.25-1.028 1.724 0l1.717 3.722 2.044.242 2.026.24c1.124.133 1.364.871.533 1.64L14.184 9.38z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <span>{{ timeFormatter.format(new Date(order.dateCreated)) }}</span>
      </div>
    </button>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Order } from "~/types";

const props = defineProps<{
  order: Order;
  currentPage: number;
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

const observeOrder = ref(false);

onMounted(() => {
  observeOrder.value = !!props.order.isFavorite;
});

async function handleObserveOrder(orderId: number) {
  const res = await $fetch(`/api/observeOrder`, {
    method: "POST",
    body: { orderId, observe: !observeOrder.value },
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  });
  if (res.status == "success") {
    observeOrder.value = !observeOrder.value;
  }
}
</script>
