import { ref } from "vue";

// Lokales notifications-Array
const notifications = ref([]);

// Funktion zum Hinzufügen einer Notification
export const addNotification = (message, status = "info", duration = 5000) => {
  notifications.value.push({ message, status, duration });
};

// Funktion zum Zugriff auf notifications
export const useNotifications = () => notifications;
