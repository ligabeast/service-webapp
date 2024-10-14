<template>
  <div class="flex flex-col space-y-2">
    <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Anschrift</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.adress"
        v-html="order?.adress"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">KLS-ID</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.kls_id"
        v-html="order?.kls_id"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsnummer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.ordernumber"
        v-html="order?.ordernumber"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">status</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.status"
        v-html="order?.status"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftraganfrang</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="orderStarted"
        v-html="timeFormatter.format(new Date(orderStarted.dateCreated))"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsabmeldung</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.dateCreated"
        v-html="timeFormatter.format(new Date(order?.dateCreated))"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsdauer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2"
        v-if="formattedDuration"
        v-html="formattedDuration"
      ></div>
    </div>
    <NuxtLink to="/home" class="flex w-full items-center justify-center">
      <button
        class="bg-blue-500 h-14 w-1/3 rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
      >
        Zurück zum Hauptmenü
      </button>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type { OrderResponse } from "~/types";

// Get the orderid from the route parameters
const route = useRoute();
const orderid = route.params.orderid;

const timeFormatter = new Intl.DateTimeFormat("de", {
  day: "2-digit",
  year: "numeric",
  month: "2-digit",
  minute: "2-digit",
  hour: "2-digit",
});

const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});
const orderStarted = ref<any | null>(
  data.data.filter((e: any) => e.status == "started")[0]
);
const order = ref<any | null>(
  data.data.filter((e: any) => e.status == "completed")[0]
);
console.log(order.value);
console.log(orderStarted.value);

const formattedDuration = computed(() => {
  if (!orderStarted.value || !order.value) return null;

  const start = new Date(orderStarted.value.dateCreated).getTime();
  const end = new Date(order.value.dateCreated).getTime();
  const durationMs = end - start;

  // Calculate hours and minutes
  const totalMinutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format as hh:mm
  return `${String(hours).padStart(2, "0")}h:${String(minutes).padStart(
    2,
    "0"
  )}m`;
});
</script>
