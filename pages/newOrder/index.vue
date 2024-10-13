<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <h1 class="font-semibold text-2xl text-center">Neue Position anlegen</h1>
    <OrderTypeSelector @changed="selectedOrderType = $event" />
    <template v-if="selectedOrderType === 'Connect'">
      <ConnectOrderForm />
    </template>
  </div>
</template>

<script setup lang="ts">
const selectedOrderType = ref("Connect");
</script>
