<template>
  <div
    class="fixed -top-0 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-50 h-dvh w-dvw"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-4"
    >
      <h1 class="text-xl font-bold">
        Ihr Auftrag wurde erfolgreich abgemeldet.
      </h1>
      <span
        class="text-base text-center text-gray-700 font-semibold"
        v-if="selectedOrderType === 'connect'"
        >Bitte in Connect Gruppe einfügen.</span
      >
      <span
        class="text-sm text-gray-700 font-semibold"
        v-else-if="selectedOrderType === 'gwv'"
      >
        Bitte in GWV Gruppe einfügen mit
        <span class="font-[800]">mindestens 5 Bildern</span>
      </span>
      <button
        class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
        @click="handleCopyWhatsapp"
      >
        Whatsapp Api
      </button>

      <button
        class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
        @click="handleCopyWhatsapp2"
      >
        Zwischenspeicher
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
  selectedOrderType: string;
  kls_id: string;
  commentCopy: string;
  notCompletedReason: string;
  ne3error: any;
}>();

// Computed für WhatsApp-Ergebnis
const whatsappResult = computed(() => {
  const result = [];
  if (
    props.insertedPositions.filter(
      (position) =>
        position.name === "Gf-TA Connect Only" ||
        position.name === "Connect mit Herstellen Ne4"
    ).length > 0
  ) {
    if (
      props.ne3error.ne3error == "Ja" &&
      props.ne3error.ne3errorRemoved === "Nein"
    ) {
      result.push("Ne4 erledigt und inventarisiert mit Ne3-Fehler");
    } else if (props.ne3error.ne3errorRemoved === "Ja") {
      result.push("Ne4 erledigt und inventarisiert mit Ne3-Fehler beseitigt");
    } else {
      result.push("Erledigt und inventarisiert");
    }
  } else if (
    props.insertedPositions.filter(
      (position) => position.name === "nicht erledigt - Connect Auftrag"
    ).length > 0
  ) {
    result.push("Connect Nicht Erledigt");
  } else if (
    props.insertedPositions.filter((position) => position.name === "GWV Basic")
      .length > 0
  ) {
    result.push("GWV Erledigt");
    if (
      props.ne3error.ne3error == "Ja" &&
      props.ne3error.ne3errorRemoved === "Nein"
    ) {
      result.push("mit Ne3-Fehler");
    } else if (props.ne3error.ne3errorRemoved === "Ja") {
      result.push("mit Ne3-Fehler beseitigt");
    }
  } else if (
    props.insertedPositions.filter(
      (position) => position.name === "nicht erledigt - GWV Auftrag"
    ).length > 0
  ) {
    result.push("GWV Nicht Erledigt");
  } else if (
    props.insertedPositions.filter(
      (position) => position.name === "Doppelauftrag erledigt"
    ).length > 0
  ) {
    result.push("Doppelauftrag erledigt");
    if (
      props.ne3error.ne3error == "Ja" &&
      props.ne3error.ne3errorRemoved === "Nein"
    ) {
      result.push("mit Ne3-Fehler");
    } else if (props.ne3error.ne3errorRemoved === "Ja") {
      result.push("mit Ne3-Fehler beseitigt");
    }
  }

  return result.join(" ");
});

// Generiere WhatsApp-Format
function getWhatsappFormatt() {
  let text =
    props.adress +
    "\n" +
    "Auftragsnummer" +
    "\n" +
    props.ordernumber +
    "\n" +
    "KLS-ID: " +
    props.kls_id +
    "\n" +
    whatsappResult.value +
    "\n";

  // Wenn auftrag nicht abgeschlossen
  // Auftrag konnte nicht abgeschlossen werden
  if (
    !(
      props.insertedPositions.filter(
        (position) => position.name === "nicht erledigt - Connect Auftrag"
      ).length > 0 ||
      props.insertedPositions.filter(
        (position) => position.name === "nicht erledigt - GWV Auftrag"
      ).length > 0
    )
  ) {
    if (props.notCompletedReason) {
      text += "\n" + "Auftrag konnte nicht abgeschlossen werden";
    }
  }

  if (props.notCompletedReason) {
    if (props.notCompletedReason != "Sonstiges") {
      text += "\n" + "Grund: " + props.notCompletedReason + "\n";
    } else {
      text += "\n" + "Grund: ";
    }
  }

  if (props.commentCopy) {
    text += props.commentCopy;
  }

  return text;
}

// Kopieren für WhatsApp
function handleCopyWhatsapp() {
  const text = getWhatsappFormatt();

  const encodedText = encodeURIComponent(text);

  copyToClipboard(text);

  // WhatsApp-Link öffnen
  window.open(`https://api.whatsapp.com/send?text=${encodedText}`);
}

function handleCopyWhatsapp2() {
  const text = getWhatsappFormatt();

  const encodedText = encodeURIComponent(text);

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
