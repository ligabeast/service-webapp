<template>
  <div
    class="fixed -top-0 -left-0 flex justify-center items-center z-30 h-dvh w-dvw"
    @click="emit('abort')"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-4"
      @click.stop
    >
      <h1 class="text-xl font-semibold mb-4">Kabel vergessen?</h1>

      <p>
        Es sind keine Kabel eingetragen wurden. Sind Sie sicher, dass Sie
        fortfahren möchten?
      </p>

      <div class="flex space-x-3">
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition"
          @click="emit('abort')"
        >
          Abbrechen
        </button>
        <button
          class="bg-blue-500 h-10 w-full rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
          @click="emit('submit')"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["abort", "submit"]);

const router = useRouter();
</script>
