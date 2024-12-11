<template>
  <div
    class="rounded-md border border-gray-300 p-4 space-y-4 shadow-md bg-gray-200"
    v-if="props.show"
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
          <!-- Letzten 30 Tage -->
          <option value="last30days">Letzten 30 Tage</option>
          <!-- Diese Woche -->
          <option value="currentWeek">Diese Woche</option>
          <!-- Letzte Woche -->
          <option value="lastWeek">Letzte Woche</option>
          <!-- Diesen Monat + die letzten zwei Monate -->
          <option value="currentMonth">Diesen Monat</option>
          <option value="lastMonth">Letzter Monat</option>
          <option value="monthBeforeLast">Vorletzter Monat</option>
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
    <div v-if="props.pagination">
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

    <!-- Filter für Kls -->
    <div v-if="props.extraFilters">
      <label for="sort" class="block text-sm font-medium text-gray-700">
        Filtern nach KLS-ID
      </label>
      <input
        id="klsId"
        v-model="filters.klsId"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white py-1 px-1"
        placeholder="KLS-ID"
      />
    </div>

    <!-- Filter für Adresse -->
    <div v-if="props.extraFilters">
      <label for="sort" class="block text-sm font-medium text-gray-700">
        Filtern nach Adresse
      </label>
      <input
        v-model="filters.adress"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white py-1 px-1"
        placeholder="PLZ / Ort / ..."
      />
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
  show: boolean;
  pagination: boolean;
  extraFilters: boolean;
  filters: {
    perPage?: number;
    startDate: string | null;
    endDate: string | null;
    timeRange: string;
    sort?: string;
    orderType: string;
    adress?: string;
    klsId?: string;
  };
}>();

const emit = defineEmits(["applyFilters"]);

const { filters } = toRefs(props);

// Funktionen
const applyFilters = () => {
  // emit only the props that were given
  if (!props.pagination) {
    filters.value.perPage = undefined;
    filters.value.sort = undefined;
  }
  emit("applyFilters", filters.value);
};

const resetFilters = () => {
  filters.value.perPage = 10;
  filters.value.timeRange = "last30days";
  filters.value.startDate = "";
  filters.value.endDate = "";
  filters.value.sort = "date-desc";
  filters.value.orderType = "all";
  filters.value.klsId = "";
  filters.value.adress = "";
  updateDateRange();
};
const updateDateRange = () => {
  const now = new Date();
  const dayOfWeek = (now.getUTCDay() + 6) % 7; // Montag als 0, Sonntag als 6

  if (filters.value.timeRange === "last30days") {
    filters.value.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
  } else if (filters.value.timeRange === "currentMonth") {
    filters.value.startDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1)
    )
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)
    )
      .toISOString()
      .split("T")[0];
  } else if (filters.value.timeRange === "lastMonth") {
    filters.value.startDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)
    )
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 0)
    )
      .toISOString()
      .split("T")[0];
  } else if (filters.value.timeRange === "monthBeforeLast") {
    filters.value.startDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() - 2, 1)
    )
      .toISOString()
      .split("T")[0];
    filters.value.endDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() - 1, 0)
    )
      .toISOString()
      .split("T")[0];
  } else if (filters.value.timeRange === "currentWeek") {
    const startOfWeek = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
    );
    const endOfWeek = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7)
    );
    filters.value.startDate = startOfWeek.toISOString().split("T")[0];
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);
    filters.value.startDate = startOfWeek.toISOString().split("T")[0];
    filters.value.endDate = endOfWeek.toISOString().split("T")[0];
  } else if (filters.value.timeRange === "lastWeek") {
    const startOfLastWeek = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7)
    );
    const endOfLastWeek = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
    ); // Exklusiv: Montag der aktuellen Woche
    filters.value.startDate = startOfLastWeek.toISOString().split("T")[0];
    filters.value.endDate = endOfLastWeek.toISOString().split("T")[0];
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
