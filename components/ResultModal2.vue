<template>
  <div
    class="fixed -top-4 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-50 h-dvh w-dvw"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-4"
    >
      <h1 class="text-xl font-bold">
        Ihr Auftrag wurde erfolgreich abgemeldet.
      </h1>
      <span class="text-base text-center text-gray-700 font-semibold"
        >Bitte in der Bemerkung bei Kasys einfügen.</span
      >
      <button
        class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
        @click="handleCopyKasys"
      >
        Copy Kasys
      </button>

      <button
        class="bg-blue-500 h-10 w-full rounded-md hover:bg-blue-600 transition text-white"
        @click="emit('next')"
      >
        Weiter
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits(["next"]);

// Props
const props = defineProps<{
  insertedPositions: any[];
  adress: string;
  ordernumber: string;
  kls_id: string;
  commentCopy: string;
  notCompletedReason: string;
  ne3error: any;
}>();

// Kopieren für Kasys
function handleCopyKasys() {
  let text = props.insertedPositions
    .map((position) => {
      if (position.dynamic == true) {
        return position.quantity + " " + position.name;
      } else {
        return position.name;
      }
    })
    .join("; ");
  if (props.commentCopy) {
    text += "\n" + props.commentCopy;
  }
  copyToClipboard(text);
}

// Universelle Kopierfunktion
function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Clipboard API
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Fehler beim Kopieren:", err);
    });
  } else {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Kopieren fehlgeschlagen", err);
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
</script>
