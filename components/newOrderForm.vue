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
    console.log("Bitte füllen Sie alle Felder aus");
    addNotification("Bitte füllen Sie alle Felder aus", "error", 3000);
    loading.value = false;
    return;
  }
  $fetch("/api/orderCreate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    body: JSON.stringify({
      ordernumber: ordernumber.value,
      kls_id: kls_id.value,
      adress: adress.value,
    }),
  })
    .then((res) => {
      loading.value = false;
      addNotification(res.message, res.status, 3000);
      if (res.status === "success") {
        console.log("Order created successfully");

        // Reset the form fields
        ordernumber.value = "";
        kls_id.value = "";
        adress.value = "";
        navigateTo("/ongoingOrders");
      } else {
        console.log("Failed to create order", res);
      }
    })
    .catch((error) => {
      loading.value = false;
      console.log("Error occurred while creating order:", error);
    });
}

// Automatische Zwischenablage-Funktionalität
async function populateFromClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    console.log("Clipboard text:", clipboardText);
    if (clipboardText) {
      // Validierung basierend auf Formaten
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
      }
    }
  } catch (error) {
    console.error("Fehler beim Lesen der Zwischenablage:", error);
  }
}

onMounted(() => {
  populateFromClipboard();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("Die Seite wurde betreten.");
      setTimeout(() => {
        populateFromClipboard();
      }, 300);
    }
  });
});
</script>
