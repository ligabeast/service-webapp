<template>
  <div
    class="fixed -top-4 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-50 h-dvh w-dvw"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-4"
    >
      <h1 class="text-xl font-bold pb-5">
        Ihr Auftrag wurde erfolgreich abgemeldet.
      </h1>
      <div class="flex space-x-5 justify-center items-center h-full w-full">
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
          @click="handleCopyWhatsapp"
        >
          Copy Whatsapp
        </button>
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
          @click="handleCopyKasys"
        >
          Copy Kasys
        </button>
      </div>
      <NuxtLink to="/home">
        <button
          class="bg-blue-500 h-10 w-full rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
        >
          Zurück zum Hauptmenü
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  insertedPositions: any[];
  adress: string;
  ordernumber: string;
  kls_id: string;
}>();

const whatsappResult = computed(() => {
  const result = [];
  if (
    props.insertedPositions.filter(
      (position) =>
        position.name === "Gf-TA Connect Only" ||
        position.name === "Connect mit Herstellen Ne4"
    ).length > 0
  ) {
    result.push("Erledigt und inventarisiert");
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
  } else if (
    props.insertedPositions.filter(
      (position) => position.name === "nicht erledigt - GWV Auftrag"
    ).length > 0
  ) {
    result.push("GWV Nicht Erledigt");
  }
  // join by next line
  return result.join("\n");
});

function getWhatsappFormatt() {
  return (
    props.adress +
    "\n" +
    "Auftragsnummer" +
    "\n" +
    props.ordernumber +
    "\n" +
    "KLS-ID: " +
    props.kls_id +
    "\n" +
    whatsappResult.value
  );
}

function handleCopyWhatsapp() {
  const text = getWhatsappFormatt();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Moderne Clipboard API verwenden
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Text erfolgreich kopiert!");
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren in die Zwischenablage:", err);
        fallbackCopyTextToClipboard(text);
      });
  } else {
    // Fallback verwenden, wenn Clipboard API nicht unterstützt wird
    fallbackCopyTextToClipboard(text);
  }
}

function handleCopyKasys() {
  const text = props.insertedPositions
    .map((position) => {
      if (position.dynamic == true) {
        return position.quantity + " " + position.name;
      } else {
        return position.name;
      }
    })
    .join("; ");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Text erfolgreich kopiert!");
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren in die Zwischenablage:", err);
        fallbackCopyTextToClipboard(text);
      });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// Fallback-Methode, um Text zu kopieren, falls Clipboard API nicht funktioniert
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Textarea unsichtbar machen
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);

  // Markiere den Text und kopiere ihn
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "erfolgreich" : "fehlgeschlagen";
    console.log("Fallback: Kopieren war " + msg);
    alert("Text erfolgreich kopiert!");
  } catch (err) {
    console.error("Fallback: Fehler beim Kopieren", err);
  }

  document.body.removeChild(textArea);
}
</script>
