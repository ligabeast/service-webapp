<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <div class="flex justify-between">
      <span class="font-semibold text-2xl">Statistiken</span>

      <!-- Trigger für den Filter (optional) -->
      <button
        class="w-12 h-12 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
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
        :show="showFilters"
        :pagination="false"
        :filters="filters"
        @applyFilters="handleApplyFilters"
      />
    </transition>

    <!-- Anzahl an Aufträgen pro Tag -->
    <div class="flex-grow bg-gray-100 rounded-md shadow-md p-4">
      <highchart
        v-if="chartOptions1 != null"
        :options="chartOptions1"
        :update="['options.title', 'options.series']"
      />
    </div>

    <!-- Auftragstyp-Verteilung -->
    <div class="flex-grow bg-gray-100 rounded-md shadow-md p-4">
      <highchart
        v-if="chartOptions2 != null"
        :options="chartOptions2"
        :update="['options.title', 'options.series']"
      />
    </div>

    <!-- Positions-Verteilung -->
    <div class="flex-grow bg-gray-100 rounded-md shadow-md p-4">
      <div class="flex justify-end mb-2">
        <button
          @click="toggleChart3View"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {{
            chart3View === "dynamic"
              ? "Statische Positionen anzeigen"
              : "Dynamische Positionen anzeigen"
          }}
        </button>
      </div>
      <highchart
        v-if="chartOptions3 != null"
        :options="chartOptions3"
        :update="['options.title', 'options.series']"
      />
    </div>

    <!-- Positionen über die Zeit (nicht erledigt zusammen gwv / connect/ erledigt) -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { addNotification } from "~/notification.ts";

// Daten und Logik
const showFilters = ref(false);
const chart3View = ref("dynamic"); // Standardansicht: Dynamische Positionen
const now = new Date();

const filters = ref({
  timeRange: "currentMonth",
  startDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)) // Erster Tag des Monats in UTC
    .toISOString()
    .split("T")[0],
  endDate: new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  ) // Morgen in UTC
    .toISOString()
    .split("T")[0],
  orderType: "all",
});

const chartOptions1 = ref(null);
const chartOptions2 = ref(null);
const chartOptions3 = ref(null); // Positionsverteilung
const ordersData = ref(null);

const handleApplyFilters = (appliedFilters: typeof filters.value) => {
  filters.value = appliedFilters;
  console.log("Filter angewendet:", filters.value);
  showFilters.value = false;
  fetchData();
};

const toggleChart3View = () => {
  chart3View.value = chart3View.value === "dynamic" ? "static" : "dynamic";
  updateChart3();
};

const truncateName = (name: string, maxLength: number = 12): string => {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
};

const fetchData = async () => {
  chartOptions1.value = null;
  chartOptions2.value = null;
  chartOptions3.value = null;
  $fetch("/api/getStatistics", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    query: filters.value,
  })
    .then((data) => {
      console.log("Statistiken geladen:", data);
      ordersData.value = data.data;
      updateCharts();
      addNotification("Statistiken erfolgreich geladen.", "success", 5000);
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Statistiken:", error);
      addNotification("Fehler beim Laden der Statistiken.", "error", 5000);
    });
};

const updateCharts = () => {
  if (!ordersData.value) {
    addNotification("error", "Keine Daten für die Statistiken gefunden.", 5000);
    return;
  }
  updateChart1();
  updateChart2();
  updateChart3();
};

const updateChart1 = () => {
  if (!ordersData.value.chart1 || ordersData.value.chart1.length === 0) {
    console.warn("Keine Daten für chart1 verfügbar");
    chartOptions1.value = {
      chart: { type: "line" },
      title: { text: "Keine Daten für Aufträge pro Tag verfügbar" },
      series: [],
    };
    return;
  }

  const categories = ordersData.value.chart1.map((order) =>
    new Date(order.orderDate).toLocaleDateString("de-DE")
  );
  const values = ordersData.value.chart1.map((order) => order.orderCount);

  chartOptions1.value = {
    chart: { type: "line" },
    credits: { enabled: false },
    title: { text: "Anzahl an Aufträgen pro Tag" },
    xAxis: { categories },
    yAxis: { title: { text: "Anzahl an Aufträgen" } },
    series: [{ name: "Aufträge", data: values }],
  };
};

const updateChart2 = () => {
  if (!ordersData.value.chart2 || ordersData.value.chart2.length === 0) {
    console.warn("Keine Daten für chart2 verfügbar");
    chartOptions2.value = {
      chart: { type: "pie" },
      title: { text: "Keine Daten für Auftragstypen-Verteilung verfügbar" },
      series: [],
    };
    return;
  }

  const pieData = ordersData.value.chart2.map((type) => ({
    name: type.orderType,
    y: type.count,
  }));

  chartOptions2.value = {
    chart: { type: "pie" },
    credits: { enabled: false },
    title: { text: "Auftragstypen-Verteilung" },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
      },
    },
    series: [{ name: "Auftragstypen", colorByPoint: true, data: pieData }],
  };
};

const updateChart3 = () => {
  const chart3Data =
    chart3View.value === "dynamic"
      ? ordersData.value.chart3.dynamic.map((pos) => ({
          name: truncateName(pos.positionName),
          fullName: pos.positionName,
          y: parseInt(pos.totalQuantity, 10),
        }))
      : ordersData.value.chart3.static.map((pos) => ({
          name: truncateName(pos.positionName),
          fullName: pos.positionName,
          y: parseInt(pos.count, 10),
        }));

  chartOptions3.value = {
    chart: { type: "pie" },
    credits: { enabled: false },
    title: {
      text:
        chart3View.value === "dynamic"
          ? "Dynamische Positionen-Verteilung"
          : "Statische Positionen-Verteilung",
    },
    tooltip: {
      pointFormat:
        "<b>{point.fullName}</b>: <b>{point.percentage:.1f}%</b> ({point.y})",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
      },
    },
    series: [{ name: "Positionen", colorByPoint: true, data: chart3Data }],
  };
};

fetchData();
</script>

<style scoped>
.top-to-bottom-enter-active,
.top-to-bottom-leave-active {
  transition: transform 0.5s ease-out;
}

.top-to-bottom-enter-from {
  transform: translateY(-100%);
}

.top-to-bottom-leave-to {
  transform: translateY(-100%);
}
</style>
