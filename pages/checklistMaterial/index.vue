<template>
  <div class="w-full h-full">
    <NewChecklistModal
      :is-admin="isAdmin"
      :checklist="items"
      v-if="showNewEntryModal"
      @close="showNewEntryModal = false"
      @fetch="fetchData"
    />
    <NewMaterialModal
      v-if="showNewEntry2Modal"
      @close="showNewEntry2Modal = false"
      @fetch="fetchAllMaterials"
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
      <div class="flex flex-col space-y-4" v-if="isAdmin">
        <h1 class="font-semibold text-2xl">Material management</h1>
        <MyTable2 :items="allMaterials" @update-selection="handleSelection2" />
        <div class="flex flex-col items-center justify-center space-y-3">
          <button
            class="w-96 h-12 bg-green-500 flex justify-center items-center text-base font-bold text-white rounded-md hover:bg-green-600 hover:scale-105 transition"
            @click="showNewEntry2Modal = true"
          >
            Neuer Eintrag
          </button>
          <button
            class="w-96 h-12 flex justify-center items-center text-base font-bold text-white rounded-md transition"
            :class="{
              'bg-blue-500 hover:bg-blue-600 hover:scale-105 ':
                selectedIds2.length > 0,
              'bg-gray-400': selectedIds2.length === 0,
            }"
            :disabled="selectedIds2.length === 0"
            @click="handleDelete2"
          >
            Einträge löschen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { addNotification } from "~/notification";

const selectedIds = ref([]);
const selectedIds2 = ref([]);

setTimeout(() => {
  isAdmin.value = useState("user").value.isAdmin;
  if (isAdmin.value) {
    fetchAllMaterials();
  }
}, 100);

const isAdmin = ref(false);

const data = await useFetch("/api/getMyChecklist", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});

async function fetchAllMaterials() {
  const data2 = await useFetch("/api/getAllMaterials", {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  });

  allMaterials.value = data2.data.value.data;
}
const allMaterials = ref([]);

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
const showNewEntry2Modal = ref(false);

function handleSelection(selected) {
  selectedIds.value = selected;
}

function handleSelection2(selected) {
  selectedIds2.value = selected;
}

async function handleDelete2() {
  $fetch("/api/deleteMaterials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    body: JSON.stringify({
      ids: selectedIds2.value,
    }),
  })
    .then((res) => {
      addNotification(res.message, res.status, 3000);
      fetchAllMaterials();
      fetchData();
      selectedIds2.value = [];
    })
    .catch((error) => {
      console.log("Error occurred while creating order:", error);
    });
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
      selectedIds.value = [];
    })
    .catch((error) => {
      console.log("Error occurred while creating order:", error);
    });
}
</script>
