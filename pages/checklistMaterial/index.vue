<template>
  <div class="w-full h-full">
    <NewMaterialModal
      v-if="showNewEntryModal"
      @close="showNewEntryModal = false"
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
        >
          Einträge löschen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const selectedIds = ref([]);
const items = [
  {
    id: 1,
    assigne: "Max Mustermann",
    createdAt: "2024-10-23 13:30:45",
    material: "Holz",
    quantity: 5,
    assignedFrom: "Herr Müller",
  },
  {
    id: 2,
    assigne: "Max Mustermann2",
    createdAt: "2024-10-23 13:30:45",
    material: "Holz2",
    quantity: 5,
    assignedFrom: "Herr Müller",
  },
];

const showNewEntryModal = ref(false);

function handleSelection(selected) {
  selectedIds.value = selected;
}
</script>
