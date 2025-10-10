<template>
  <div class="relative">
    <Loader v-if="loading" />
    <div class="p-4 flex flex-col space-y-4">
      <div class="flex flex-row justify-between">
        <h1 class="font-semibold text-2xl">Meine letzten Aufträge</h1>
        <button
          class="w-12 h-12 h rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
          @click="showFilter = !showFilter"
        >
          <svg
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 12L5 4" stroke="#222222" stroke-linecap="round" />
            <path d="M19 20L19 17" stroke="#222222" stroke-linecap="round" />
            <path d="M5 20L5 16" stroke="#222222" stroke-linecap="round" />
            <path d="M19 13L19 4" stroke="#222222" stroke-linecap="round" />
            <path d="M12 7L12 4" stroke="#222222" stroke-linecap="round" />
            <path d="M12 20L12 11" stroke="#222222" stroke-linecap="round" />
            <circle
              cx="5"
              cy="14"
              r="2"
              stroke="#222222"
              stroke-linecap="round"
            />
            <circle
              cx="12"
              cy="9"
              r="2"
              stroke="#222222"
              stroke-linecap="round"
            />
            <circle
              cx="19"
              cy="15"
              r="2"
              stroke="#222222"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <ClientOnly>
        <transition name="top-to-bottom" mode="out-in">
          <div v-if="showFilter">
            <OrderFilter
              :pagination="true"
              :extraFilters="true"
              :favoritesFilter="true"
              :filters="filters"
              :show="showFilter"
              @applyFilters="handleFiltersChanged"
            />
          </div>
        </transition>

        <template v-if="orders && orders.length">
          <OrderCard
            v-for="order in orders"
            :key="order.id"
            :currentPage="currentPage"
            :order="order"
          />
        </template>

        <span v-else>Keine Aufträge verfügbar</span>
      </ClientOnly>

      <!-- Pagination -->
      <div
        class="w-full flex items-center justify-center"
        v-if="orders && orders.length > 0"
      >
        <div class="flex items-center space-x-2">
          <!-- Zurück-Button -->
          <button
            :disabled="currentPage <= 1"
            @click="prevPage"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Zurück
          </button>

          <!-- Seitenanzeige -->
          <span>Seite {{ currentPage }} von {{ totalPages }}</span>

          <!-- Weiter-Button -->
          <button
            :disabled="currentPage >= totalPages"
            @click="nextPage"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      </div>
      <button
        class="bg-red-500 hover:bg-red-700 px-2 py-3 rounded text-sm text-white font-bold transition"
        @click="handleLogout()"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<style>
.top-to-bottom-enter-active,
.top-to-bottom-leave-active {
  transition: transform 0.5s ease-out;
}

.top-to-bottom-enter-from {
  transform: translateY(-100%); /* Start sliding from the top */
}

.top-to-bottom-leave-to {
  transform: translateY(-100%); /* Slide out to the bottom */
}
</style>

<script setup lang="ts">
import type { OrderResponse } from "~/types";

const loading = ref(false);
const showFilter = ref(false);
const now = new Date();

const filters = ref({
  perPage: 10,
  timeRange: "last30days",
  // last 30 days, endDate inclusive
  startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  sort: "date-desc", // Sorting order
  adress: "",
  klsId: "",
});

// get currentPage as queryparam
const route = useRoute();
const currentPage = ref(Number(route.query.currentPage) || 1);

const { data, error } = await useFetch<OrderResponse>("/api/getMyOrders", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
  query: { ...filters.value, currentPage: currentPage.value },
});
console.log("Aufträge geladen:", data.value);
const orders = ref(data.value?.data);
const totalPages = ref(data.value?.pagination?.totalPages);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    fetchData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    fetchData();
  }
};

const fetchData = async () => {
  try {
    const data = await $fetch("/api/getMyOrders", {
      method: "GET", // GET-Methode für Query-Parameter
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
      },
      query: {
        // Query-Parameter direkt in die URL einfügen
        ...filters.value,
        currentPage: currentPage.value,
      },
    });

    showFilter.value = false;
    orders.value = data?.data || [];
    totalPages.value = data?.pagination?.totalPages || 1;
    console.log("Aufträge geladen:", orders.value);
  } catch (error) {
    console.error("Fehler beim Laden der Aufträge:", error);
  }
};

async function handleFiltersChanged(newFilters: any) {
  currentPage.value = 1;
  filters.value = newFilters;
  fetchData();
}

function handleLogout() {
  useCookie("jwt").value = null;
  window.location.href = "/login"; // Redirect to login page
}
</script>
