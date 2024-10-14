import { jwtDecode } from "jwt-decode";
import { useCookie } from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
  // Code nur auf dem Client ausführen
  if (process.client) {
    // Wenn der Benutzer auf der Login-Seite ist, überspringe die Middleware
    if (to.path === "/login") {
      return;
    }

    // Verzögere den Zugriff auf das Cookie nach der Hydration mit setTimeout
    setTimeout(() => {
      const token = useCookie("jwt").value;

      console.log("Token found:", token);

      // Wenn ein Token vorhanden ist
      if (token) {
        try {
          // Token dekodieren
          const decoded = jwtDecode(token);
          console.log("Token decoded:", decoded);

          // Benutzerdaten im Zustand speichern
          useState("user").value = decoded;
        } catch (error) {
          console.log("Invalid token, redirecting to home...");
          // Asynchrone Weiterleitung zu Home
          return navigateTo("/home");
        }
      } else {
        console.log("No token found, redirecting to login...");
        // Asynchrone Weiterleitung zu Login
        return navigateTo("/login");
      }
    }, 0);
  }
});
