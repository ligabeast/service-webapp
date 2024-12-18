<template>
<Loader v-show="loading" />
  <label for="anschrift">Anschrift</label>
  <textarea
    v-model="adress"
    id="anschrift"
    class="border border-black rounded-sm h-20"
  ></textarea>

  <div class="flex space-x-3">
    <label for="anschrift" class="w-1/2">Auftragsnummer</label>
    <input
      v-model="ordernumber"
      type="text"
      class="w-full border border-black rounded-sm"
    />
  </div>
  <div class="flex space-x-3">
    <label for="anschrift" class="w-1/2">KLS-ID</label>
    <input
      type="text"
      v-model="kls_id"
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

const adress = ref<string>("");
const kls_id = ref<string>("");
const ordernumber = ref<string>("");
const loading = ref(false);

function handleSave() {
	loading.value = true;
  if (adress.value === "" || kls_id.value === "" || ordernumber.value === "") {
    console.log("Bitte füllen Sie alle Felder aus");
    addNotification("Bitte füllen Sie alle Felder aus", "error", 3000);
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
      console.log("Error occurred while creating order:", error);
    });
	
}
</script>
