<template>
  <div class="w-full border border-gray-300 rounded-lg">
    <!-- Table Header -->
    <div
      class="bg-gray-100 text-gray-800 font-semibold flex items-center w-full"
    >
      <div class="w-8 px-4 flex-grow py-2 flex items-center">
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-xs !min-w-24 text-center"
      >
        Material
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-xs min-w-20 text-center"
      >
        Zugewiesen von
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-xs min-w-20 text-center"
      >
        Zugewiesen an
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-xs min-w-24 text-center"
      >
        Erzeugt am
      </div>
    </div>

    <!-- Table Rows -->
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="flex items-center hover:bg-gray-50 h-12 w-full"
    >
      <div
        class="w-8 flex-grow h-full border-t border-gray-200 flex items-center px-4"
      >
        <input
          type="checkbox"
          v-model="selected[index]"
          @change="updateSelection"
        />
      </div>
      <div
        class="min-w-24 flex-grow py-2 border-t border-gray-200 h-full flex items-center justify-center"
      >
        <span class="text-xs text-gray-700">{{ item.materialName }}</span>
      </div>
      <div
        class="min-w-20 flex-grow px-4 py-2 border-t border-gray-200 h-full flex items-center justify-center"
      >
        <span class="text-xs text-gray-700">{{ item.assignedFrom }}</span>
      </div>
      <div
        class="min-w-20 flex-grow px-4 py-2 border-t border-gray-200 h-full flex items-center justify-center"
      >
        <span class="text-xs text-gray-700">{{ item.assignedToName }}</span>
      </div>
      <div
        class="min-w-24 flex-grow px-4 py-2 border-t border-gray-200 h-full flex items-center justify-center"
      >
        <span class="text-xs text-gray-700 text-center w-full">{{
          dateFormatter(item.createdAt)
        }}</span>
      </div>
    </div>
    <div
      class="w-full flex items-center justify-center py-3"
      v-if="props.items.length === 0"
    >
      <span class="text-bold text-gray-500 text-sm"
        >Keine Daten eingetragen</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

watch(
  () => props.items, // Was überwacht werden soll
  (newItems, oldItems) => {
    selected.value = new Array(newItems.length).fill(false);
  }
);

const dateFormatter = (date: Date | string): string => {
  const d = new Date(date);

  // Formatierung der einzelnen Teile
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Monat ist 0-basiert
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  // Zusammenfügen im gewünschten Format
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const emit = defineEmits(["updateSelection"]);

const selected = ref(new Array(props.items.length).fill(false));

const allSelected = computed(() => selected.value.every((val) => val));

function toggleAll() {
  const newValue = !allSelected.value;
  selected.value = new Array(props.items.length).fill(newValue);
  emitSelectedIds();
}

function updateSelection() {
  emitSelectedIds();
}

function emitSelectedIds() {
  const selectedIds = props.items
    .filter((_, index) => selected.value[index]) // Filter selected items
    .map((item) => item.checklistId); // Map to their IDs
  emit("updateSelection", selectedIds); // Emit selected IDs
}
</script>
