<template>
  <div
    class="rounded-md border border-gray-300 p-4 space-y-4 shadow-md bg-gray-200"
  >
    <h2 class="text-lg font-semibold text-gray-700">Filter</h2>

    <!-- Anzahl an Aufträgen pro Seite -->
    <div>
      <label for="perPage" class="block text-sm font-medium text-gray-700"
        >Aufträge pro Seite</label
      >
      <select
        id="perPage"
        v-model="filters.perPage"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white py-1"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <!-- Zeitraum -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Zeitraum</label>
      <div class="flex space-x-2 items-center w-full">
        <input
          type="date"
          v-model="filters.startDate"
          class="block flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
          placeholder="Startdatum"
        />
        <span class="text-gray-700"> bis zum </span>
        <input
          type="date"
          v-model="filters.endDate"
          class="block flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
          placeholder="Enddatum"
        />
      </div>
    </div>

    <!-- Sortierung -->
    <div>
      <label for="sort" class="block text-sm font-medium text-gray-700"
        >Sortieren nach</label
      >
      <select
        id="sort"
        v-model="filters.sort"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1 bg-white"
      >
        <option value="date-asc">Datum: Aufsteigend</option>
        <option value="date-desc">Datum: Absteigend</option>
      </select>
    </div>

    <!-- Buttons -->
    <div class="flex space-x-4">
      <button
        @click="applyFilters"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 transition"
      >
        Anwenden
      </button>
      <button
        @click="resetFilters"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
      >
        Zurücksetzen
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from "vue";

// Use `toRefs` to directly reference `props.filters`
const props = defineProps<{ filters: any }>();
const emit = defineEmits(["applyFilters"]);

const { filters } = toRefs(props);

const applyFilters = () => {
  emit("applyFilters", filters.value);
};

const resetFilters = () => {
  filters.value.perPage = 10;
  filters.value.startDate = "";
  filters.value.endDate = "";
  filters.value.sort = "date-desc";
};
</script>
