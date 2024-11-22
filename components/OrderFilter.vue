<template>
  <div
    class="rounded-md border border-gray-300 p-4 space-y-4 shadow-md bg-gray-200"
  >
    <h2 class="text-lg font-semibold text-gray-700">Filter</h2>

    <!-- Anzahl an Aufträgen pro Seite -->
    <div v-if="props.pagination">
      <label for="perPage" class="block text-sm font-medium text-gray-700">
        Aufträge pro Seite
      </label>
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
      <div>
        <select
          v-model="filters.timeRange"
          @change="updateDateRange"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1 bg-white"
        >
          <option value="last30">Letzte 30 Tage</option>
          <option value="last90">Letzte 90 Tage</option>
          <option value="custom">Benutzerdefiniert</option>
        </select>
        <div v-if="filters.timeRange === 'custom'" class="mt-2 flex space-x-2">
          <input
            type="date"
            v-model="filters.startDate"
            class="block flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          />
          <input
            type="date"
            v-model="filters.endDate"
            class="block flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          />
        </div>
      </div>
    </div>

    <!-- Auftragstyp -->
    <div>
      <label for="orderType" class="block text-sm font-medium text-gray-700">
        Auftragstyp
      </label>
      <select
        id="orderType"
        v-model="filters.orderType"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white py-1"
      >
        <option value="all">Alle</option>
        <option value="gwv">GWV</option>
        <option value="connect">Connect</option>
      </select>
    </div>

    <!-- Sortierung -->
    <div>
      <label for="sort" class="block text-sm font-medium text-gray-700">
        Sortieren nach
      </label>
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
import { toRefs, onMounted } from "vue";

// Props für die Filter-Initialisierung
const props = defineProps<{
  pagination: boolean;
  filters: {
    perPage: number;
    startDate: string | null;
    endDate: string | null;
    timeRange: string;
    sort: string;
    orderType: string;
  };
}>();

const emit = defineEmits(["applyFilters"]);

const { filters } = toRefs(props);

// Funktionen
const applyFilters = () => {
  emit("applyFilters", filters.value);
};

const resetFilters = () => {
  filters.value.perPage = 10;
  filters.value.timeRange = "last30";
  filters.value.startDate = "";
  filters.value.endDate = "";
  filters.value.sort = "date-desc";
  filters.value.orderType = "all";
  updateDateRange();
};

const updateDateRange = () => {
  const now = new Date();
  if (filters.value.timeRange === "last30") {
    filters.value.startDate = new Date(now.setDate(now.getDate() - 30))
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date().toISOString().split("T")[0];
  } else if (filters.value.timeRange === "last90") {
    filters.value.startDate = new Date(now.setDate(now.getDate() - 90))
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date().toISOString().split("T")[0];
  } else if (filters.value.timeRange === "custom") {
    filters.value.startDate = null;
    filters.value.endDate = null;
  }
};

// Set defaults on mount
onMounted(() => {
  resetFilters();
});
</script>
