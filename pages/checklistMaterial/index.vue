<template>
  <div class="w-full h-full">
    <NewMaterialModal
      v-if="showNewEntryModal"
      @close="showNewEntryModal = false"
      @fetch="fetchData"
    />
    <div class="flex w-full h-full flex-col p-4 space-y-4">
      <h1 class="font-semibold text-2xl">Benötigtes Material Checklist</h1>
      <MyTable :items="items" @updateSelection="handleSelection" />
      <div class="flex flex-col items-center justify-center space-y-3">
        <button
          class="w-96 h-12 bg-green-500 flex justify-center items-center text-base font-bold text-white rounded-md hover:bg-green-600 hover:scale-105 transition"
          @click="showNewEntryModal = true"
        >
          Neuer Eintrag
        </button>
        <button
          class="w-96 h-12 flex justify-center items-center text-base font-bold text-white rounded-md transition"
          :class="{
            'bg-blue-500 hover:bg-blue-600 hover:scale-105 ':
              selectedIds.length > 0,
            'bg-gray-400': selectedIds.length === 0,
          }"
          :disabled="selectedIds.length === 0"
          @click="handleDelete"
        >
          Einträge löschen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { addNotification } from "~/notification";

const selectedIds = ref([]);

const data = await useFetch("/api/getMyChecklist", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});

async function fetchData() {
  const data = await useFetch("/api/getMyChecklist", {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  });
  items.value = data.data.value.data;
}

console.log(data.data.value.data);
const items = ref(data.data.value.data ?? []);

const showNewEntryModal = ref(false);

function handleSelection(selected) {
  selectedIds.value = selected;
}

async function handleDelete() {
  console.log(selectedIds.value);
  $fetch("/api/deleteChecklist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    body: JSON.stringify({
      ids: selectedIds.value,
    }),
  })
    .then((res) => {
      addNotification(res.message, res.status, 3000);
      fetchData();
    })
    .catch((error) => {
      console.log("Error occurred while creating order:", error);
    });
}
</script>
