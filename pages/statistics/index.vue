<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <div class="flex justify-between">
      <span class="font-semibold text-2xl">Statistiken</span>

      <!-- Trigger für den Filter (optional) -->
      <button
        class="w-12 h-12 h rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
        @click="showFilters = !showFilters"
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

    <!-- Transition für das Reinsliden -->
    <transition name="top-to-bottom" mode="out-in">
      <OrderFilter
        v-if="showFilters"
        :filters="filters"
        @applyFilters="handleApplyFilters"
      />
    </transition>

    <!-- Platz für Statistiken -->
    <div class="flex-grow bg-gray-100 rounded-md shadow-md p-4">
      <p>Hier kommen die Statistiken...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// Daten und Logik
const showFilters = ref(false);

const filters = ref({
  timeRange: "last30",
  startDate: null,
  endDate: null,
  status: null,
  orderType: null,
  hide: false,
});

const handleApplyFilters = (appliedFilters: typeof filters.value) => {
  filters.value = appliedFilters;
  console.log("Filter angewendet:", filters.value);
};
</script>

<style scoped>
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
