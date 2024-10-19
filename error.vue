<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center text-center"
  >
    <h1 class="text-6xl font-bold mb-4">Oops!</h1>
    <p class="text-xl mb-6">Es ist ein Fehler aufgetreten.</p>
    <p v-if="error.statusCode">Fehlercode: {{ error.statusCode }}</p>
    <nuxt-link
      class="bg-blue-600 hover:bg-blue-800 transition hover:scale-105 rounded-sm px-4 py-2 mt-4 text-bold text-white"
      to="/home"
    >
      Zurück zur Startseite
    </nuxt-link>
  </div>
</template>

<script setup>
const error = defineProps({
  error: Object,
});
</script>
