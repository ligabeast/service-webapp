<template>
  <Loader v-show="loading" />
  <label for="anschrift">Anschrift</label>
  <textarea
    v-model="adress"
    id="anschrift"
    class="border border-black rounded-sm h-20"
  ></textarea>

  <div class="flex space-x-3">
    <label for="ordernumber" class="w-1/2">Auftragsnummer</label>
    <input
      v-model="ordernumber"
      type="text"
      id="ordernumber"
      class="w-full border border-black rounded-sm"
    />
  </div>
  <div class="flex space-x-3">
    <label for="kls-id" class="w-1/2">KLS-ID</label>
    <input
      type="text"
      v-model="kls_id"
      id="kls-id"
      class="w-full border border-black rounded-sm"
    />
  </div>

  <button
    class="w-full h-12 bg-blue-500 flex justify-center items-center text-lg font-bold text-white rounded-md"
    @click="handleSave"
    :disabled="loading"
  >
    Speichern
  </button>
</template>

<script setup lang="ts">
import { addNotification } from "~/notification.ts";
import { onMounted, ref } from "vue";

const adress = ref<string>("");
const kls_id = ref<string>("");
const ordernumber = ref<string>("");
const loading = ref(false);

function handleSave() {
  loading.value = true;

  if (adress.value === "" || kls_id.value === "" || ordernumber.value === "") {
    addNotification("Bitte füllen Sie alle Felder aus", "error", 3000);
    loading.value = false;
    return;
  }

  if (!/^\d{7,8}$/.test(kls_id.value)) {
    addNotification("Ungültige KLS-ID", "error", 3000);
    loading.value = false;
    return;
  }

  if (!/^\d{12}$/.test(ordernumber.value)) {
    addNotification("Ungültige Auftragsnummer", "error", 3000);
    loading.value = false;
    return;
  }

  adress.value = adress.value.replace(/^\s+/, "");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await $fetch("/api/orderCreate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useCookie("jwt").value}`,
          },
          body: JSON.stringify({
            ordernumber: ordernumber.value,
            kls_id: kls_id.value,
            adress: adress.value,
            latitude: lat,
            longitude: lon,
          }),
        });

        loading.value = false;
        addNotification(res.message, res.status, 3000);

        if (res.status === "success") {
          ordernumber.value = "";
          kls_id.value = "";
          adress.value = "";
          navigateTo("/ongoingOrders");
        }
      } catch (error) {
        loading.value = false;
        console.error("Fehler beim Speichern des Auftrags:", error);
      }
    },
    (err) => {
      loading.value = false;
      console.error("Fehler beim Erfassen der Position:", err);
      addNotification("GPS konnte nicht erfasst werden", "warning", 3000);
    }
  );
}

async function populateFromClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (!clipboardText) {
      throw new Error("Die Zwischenablage ist leer.");
    }

    console.log("Clipboard-Inhalt:", clipboardText);

    // Validierungslogik für das Clipboard
    if (/^\d{7,8}$/.test(clipboardText.trim())) {
      kls_id.value = clipboardText.trim();
    } else if (/^\d{12}$/.test(clipboardText.trim())) {
      ordernumber.value = clipboardText.trim();
    } else if (
      /^[A-Za-zäöüß.\-\s]+ \d+[A-Za-z]?\s+\d{5}\s+[A-Za-zäöüß.\-\s]+$/.test(
        clipboardText.trim()
      )
    ) {
      adress.value = clipboardText.trim();
    } else {
      addNotification(
        "Clipboard-Inhalt konnte nicht zugeordnet werden.",
        "warning",
        3000
      );
    }
  } catch (error) {
    console.error("Fehler beim Lesen der Zwischenablage:", error);
    addNotification("Fehler beim Lesen der Zwischenablage", "error", 3000);
  }
}
</script>
