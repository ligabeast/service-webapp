<script setup>
import { useNotifications } from "~/notification.ts";

// Reaktives Array für Notifications
const notifications = useNotifications();
</script>

<template>
  <div class="fixed top-4 right-4 z-50">
    <!-- TransitionGroup für gestapelte Animation -->
    <TransitionGroup name="stack" tag="div" class="space-y-4">
      <Notifer
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :status="notification.status"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Transition für gestapelte Animation */
.stack-enter-active,
.stack-leave-active {
  transition: all 0.4s ease;
}

.stack-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.stack-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.stack-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.stack-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
