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
  if (!/^\d{7,8}$/.test(kls_id.value)) {
    console.log("Ungültige KLS-ID");
    addNotification("Ungültige KLS-ID", "error", 3000);
    loading.value = false;
    return;
  } else if (!/^\d{12}$/.test(ordernumber.value)) {
    console.log("Ungültige Auftragsnummer");
    addNotification("Ungültige Auftragsnummer", "error", 3000);
    loading.value = false;
    return;
  }

  //remove starting linebreaks
  adress.value = adress.value.replace(/^\s+/, "");

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

async function handleCopy() {
  try {
    // Prüfen, ob Clipboard-API verfügbar ist
    if (!navigator.clipboard || !navigator.permissions) {
      throw new Error(
        "Clipboard-API wird in diesem Browser nicht unterstützt."
      );
    }

    const permission = await navigator.permissions.query({
      name: "clipboard-read" as PermissionName,
    });
    console.log("Permission state:", permission.state);
    if (permission.state === "denied") {
      throw new Error("Clipboard-Zugriff wurde verweigert.");
    }

    // Inhalt aus der Zwischenablage lesen
    await populateFromClipboard();
  } catch (error) {
    console.error("Fehler beim Zugriff auf die Zwischenablage:", error);
    addNotification(
      "Fehler beim Zugriff auf die Zwischenablage",
      "error",
      3000
    );
  }
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
