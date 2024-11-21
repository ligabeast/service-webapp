<template>
  <div
    v-if="visible"
    :class="['notification', statusClass]"
    class="fixed top-4 right-4 px-4 py-3 rounded-md shadow-md flex flex-col space-y-2"
  >
    <!-- Nachricht und Icon -->
    <div class="flex items-center space-x-2">
      <div>
        <svg
          v-if="status === 'success'"
          class="w-5 h-5 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else-if="status === 'error'"
          class="w-5 h-5 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <svg
          v-else-if="status === 'info'"
          class="w-5 h-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M12 9h.01M9 21h6m-3-4v4"
          />
        </svg>
      </div>
      <span class="text-sm">{{ message }}</span>
    </div>

    <!-- Fortschrittsbalken -->
    <div class="h-1 w-full bg-gray-200 relative overflow-hidden rounded-md">
      <div
        class="h-full absolute rounded-md transition-all"
        :style="{ width: progress + '%', backgroundColor: progressColor }"
      ></div>
    </div>
  </div>
</template>

#### **Script** ```vue
<script setup>
import { ref, computed, onMounted } from "vue";

// Props
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "info",
    validator: (value) => ["success", "error", "info"].includes(value),
  },
  duration: {
    type: Number,
    default: 5000, // Dauer der Notification in Millisekunden
  },
});

// Lokale Zustände
const visible = ref(true);
const progress = ref(100); // Fortschritt in Prozent

// Dynamische Hintergrundfarbe für den Fortschrittsbalken
const progressColor = computed(() => {
  switch (props.status) {
    case "success":
      return "#28a745"; // Grün
    case "error":
      return "#dc3545"; // Rot
    case "info":
      return "#17a2b8"; // Blau
    default:
      return "#6c757d"; // Grau (Fallback)
  }
});

// Dynamische Klasse basierend auf dem Status
const statusClass = computed(() => {
  switch (props.status) {
    case "success":
      return "bg-green-100 border-l-4 border-green-500";
    case "error":
      return "bg-red-100 border-l-4 border-red-500";
    case "info":
      return "bg-blue-100 border-l-4 border-blue-500";
    default:
      return "bg-gray-100 border-l-4 border-gray-500";
  }
});

// Schließen der Notification
const close = () => {
  visible.value = false;
};

// Fortschrittsbalken-Animation
onMounted(() => {
  const intervalTime = 50; // Wie oft der Fortschritt aktualisiert wird (in ms)
  const decrement = 100 / (props.duration / intervalTime); // Schrittweite des Fortschritts

  const progressInterval = setInterval(() => {
    progress.value -= decrement;

    if (progress.value <= 0) {
      clearInterval(progressInterval);
      close();
    }
  }, intervalTime);
});
</script>

#### **Style** ```vue
<style scoped>
.notification {
  animation: fade-in 0.5s ease-out;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.notification.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

/* Animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
