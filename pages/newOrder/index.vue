<template>
  <div class="flex flex-col w-full h-full items-center p-6 space-y-6">
    <Loader v-show="loading" />
    <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-3 bg-blue-500 transition-all duration-500"
        :style="{ width: progressWidth }"
      ></div>
    </div>

    <h1 class="text-2xl font-semibold text-center">
      <span>
        <svg
          class="h-8 w-8 inline-block mr-2"
          viewBox="0 0 1024 1024"
          fill="#000000"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M300 462.4h424.8v48H300v-48zM300 673.6H560v48H300v-48z"
            fill=""
          />
          <path
            d="M818.4 981.6H205.6c-12.8 0-24.8-2.4-36.8-7.2-11.2-4.8-21.6-11.2-29.6-20-8.8-8.8-15.2-18.4-20-29.6-4.8-12-7.2-24-7.2-36.8V250.4c0-12.8 2.4-24.8 7.2-36.8 4.8-11.2 11.2-21.6 20-29.6 8.8-8.8 18.4-15.2 29.6-20 12-4.8 24-7.2 36.8-7.2h92.8v47.2H205.6c-25.6 0-47.2 20.8-47.2 47.2v637.6c0 25.6 20.8 47.2 47.2 47.2h612c25.6 0 47.2-20.8 47.2-47.2V250.4c0-25.6-20.8-47.2-47.2-47.2H725.6v-47.2h92.8c12.8 0 24.8 2.4 36.8 7.2 11.2 4.8 21.6 11.2 29.6 20 8.8 8.8 15.2 18.4 20 29.6 4.8 12 7.2 24 7.2 36.8v637.6c0 12.8-2.4 24.8-7.2 36.8-4.8 11.2-11.2 21.6-20 29.6-8.8 8.8-18.4 15.2-29.6 20-12 5.6-24 8-36.8 8z"
            fill=""
          />
          <path
            d="M747.2 297.6H276.8V144c0-32.8 26.4-59.2 59.2-59.2h60.8c21.6-43.2 66.4-71.2 116-71.2 49.6 0 94.4 28 116 71.2h60.8c32.8 0 59.2 26.4 59.2 59.2l-1.6 153.6z m-423.2-47.2h376.8V144c0-6.4-5.6-12-12-12H595.2l-5.6-16c-11.2-32.8-42.4-55.2-77.6-55.2-35.2 0-66.4 22.4-77.6 55.2l-5.6 16H335.2c-6.4 0-12 5.6-12 12v106.4z"
            fill=""
          />
        </svg>
      </span>
      Auftrags Anmeldung
    </h1>

    <div
      class="relative w-full max-w-3xl overflow-hidden h-fit border border-gray-300 rounded-lg bg-white shadow-md"
    >
      <div
        class="flex transition-transform duration-500 ease-in-out w-full h-full"
        :style="{ transform: `translateX(-${(currentStep - 1) * 100}%)` }"
      >
        <!-- Fenster 1 -->
        <div
          class="w-full flex-shrink-0 justify-between p-6 flex flex-col h-full"
        >
          <div class="flex flex-col space-y-4">
            <h2 class="text-xl font-bold">Schritt 1 — KLS prüfen</h2>

            <label class="font-medium text-sm text-gray-600">KLS-ID</label>
            <input
              v-model="form.klsId"
              type="number"
              class="border rounded-md p-2"
              placeholder="KLS-ID eingeben"
            />

            <button
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              @click="checkKls"
            >
              KLS prüfen
            </button>

            <div
              v-if="klsChecked"
              class="text-green-600 font-semibold flex items-center"
            >
              <svg
                class="h-6 w-6 inline-block mr-2"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
                />
              </svg>
              <span>KLS überprüft!</span>
            </div>
            <span
              v-if="klsFound && klsFound.address === null && klsChecked"
              class="font-semibold text-gray-600"
              >KLS-ID enthält keine Historie</span
            >
            <div
              v-if="klsFound && klsFound.address"
              class="text-gray-700 space-y-2"
            >
              <div class="flex flex-col">
                <strong>Adresse:</strong>
                {{ klsFound.address }}
              </div>
              <div class="flex flex-col">
                <strong>Gefundene Aufträge:</strong>
                {{ klsFound.ordersFound.total }} (GWV:
                {{ klsFound.ordersFound.gwv }}, Connect:
                {{ klsFound.ordersFound.connect }}, Bulk:
                {{ klsFound.ordersFound.bulk }})
              </div>
              <div class="flex flex-col">
                <strong>Letzter Auftrag:</strong>
                {{ klsFound.lastService }}
              </div>
            </div>
          </div>
          <div
            class="flex items-center mt-8"
            :class="{
              'justify-between': klsChecked && klsFound,
              'justify-end': !klsFound,
            }"
          >
            <NuxtLink :to="`/imagesLookup/${form.klsId}?backToNewOrder=true`">
              <button
                v-if="klsChecked && klsFound"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
              >
                KLS-History
              </button>
            </NuxtLink>

            <button
              :disabled="!klsChecked"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
              @click="nextStep"
            >
              Weiter →
            </button>
          </div>
        </div>

        <!-- Fenster 2 -->
        <div
          class="w-full flex-shrink-0 p-6 flex flex-col justify-between h-full"
        >
          <div class="flex flex-col space-y-4">
            <h2 class="text-xl font-bold">Schritt 2 — Auftragsdaten</h2>

            <label>Auftragsnummer</label>
            <input
              v-model="form.ordernumber"
              type="number"
              class="border rounded-md p-2"
            />

            <label>Auftragstyp</label>
            <select
              v-model="form.orderType"
              class="border rounded-md p-2 bg-white"
            >
              <option value="connect">Connect</option>
              <option value="gwv">GWV</option>
              <option value="bulk">Bulk</option>
            </select>
          </div>
          <div class="flex justify-between mt-auto">
            <button
              class="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
              @click="prevStep"
            >
              ← Zurück
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              @click="nextStep"
            >
              Weiter →
            </button>
          </div>
        </div>

        <!-- Fenster 3 -->
        <div
          class="w-full flex-shrink-0 p-6 flex flex-col justify-between h-full"
        >
          <div class="flex flex-col space-y-4 py-">
            <h2 class="text-xl font-bold">Schritt 3 — Dateneingabe</h2>

            <div class="flex flex-col space-y-4">
              <div
                v-if="klsFound === null || (klsFound && !klsFound.address)"
                class="flex flex-col space-y-1"
              >
                <label>Adresse</label>
                <textarea
                  v-model="form.address"
                  id="anschrift"
                  class="border border-black rounded-sm h-20"
                ></textarea>
              </div>
              <div
                v-if="klsFound === null || (klsFound && !klsFound.klsData)"
                class="flex flex-col space-y-1"
              >
                <label>Wohneinheiten</label>
                <input
                  v-model="form.units"
                  type="number"
                  class="border border-black rounded-sm h-10 p-2"
                />
              </div>
              <div
                v-if="
                  klsFound &&
                  klsFound.klsData &&
                  !(
                    !klsFound.address ||
                    !klsFound.klsData ||
                    form.orderType === 'gwv' ||
                    (form.orderType === 'connect' && computeShowGWV)
                  )
                "
              >
                <strong class="text-gray-700 font-base"
                  >Keine zusätzliche Dateneingabe nötig</strong
                >
              </div>
              <div
                v-if="form.orderType === 'connect' && computeShowGWV"
                class="flex flex-col space-y-2"
              >
                <strong>Hast du einen GWV-Auftrag?</strong>
                <!-- radio button ja nein -->
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio text-blue-600"
                      value="yes"
                      name="gwv"
                      v-model="gwvOrderRadio"
                    />
                    <span class="ml-2">Ja</span>
                  </label>
                  <label class="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      class="form-radio text-blue-600"
                      value="no"
                      name="gwv"
                      v-model="gwvOrderRadio"
                    />
                    <span class="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              <div
                v-if="gwvOrderRadio === 'yes' && form.orderType === 'connect'"
                class="flex flex-col space-y-2"
              >
                <label class="text-base">GWV-Auftragsnummer</label>
                <input
                  type="number"
                  class="border rounded-md p-2"
                  v-model="form.gwvOrderNumber"
                  placeholder="GWV-Auftragsnummer eingeben"
                />
              </div>
              <div
                v-if="form.orderType === 'gwv'"
                class="flex flex-col space-y-2"
              >
                <strong>Hast du einen Connect-Auftrag?</strong>
                <!-- radio button ja nein -->
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio text-blue-600"
                      value="yes"
                      name="connect"
                      v-model="connectOrderRadio"
                    />
                    <span class="ml-2">Ja</span>
                  </label>
                  <label class="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      class="form-radio text-blue-600"
                      value="no"
                      name="connect"
                      v-model="connectOrderRadio"
                    />
                    <span class="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              <div
                v-if="connectOrderRadio === 'yes' && form.orderType === 'gwv'"
                class="flex flex-col space-y-2"
              >
                <label class="text-base">Connect-Auftragsnummer</label>
                <input
                  type="number"
                  class="border rounded-md p-2"
                  v-model="form.connectOrderNumber"
                  placeholder="Connect-Auftragsnummer eingeben"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-8">
            <button
              class="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
              @click="prevStep"
            >
              ← Zurück
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              @click="orderCreate"
            >
              Auftrag anlegen
            </button>
          </div>
        </div>
        <div
          class="w-full flex-shrink-0 p-6 flex flex-col justify-between h-full"
        >
          <h1 class="text-lg font-semibold">
            Auftrag wurde erfolgreich angelegt!
          </h1>
          <div class="flex justify-between mt-8">
            <NuxtLink :to="`/imagesLookup/${form.klsId}`">
              <button
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
              >
                KLS-History
              </button>
            </NuxtLink>

            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
              @click="nextStep"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { addNotification } from "~/notification";

const currentStep = ref(1);
const totalSteps = 4;
const route = useRoute();
const klsId = route.query.kls_id as string;

const form = ref({
  klsId: "",
  ordernumber: "",
  orderType: "",
  address: "",
  units: null as number | null,
  gwvOrderNumber: "",
  connectOrderNumber: "",
});

const klsChecked = ref(false);
const klsFound = ref<any>(null);
const gwvOrderRadio = ref("no");
const connectOrderRadio = ref("no");
const loading = ref(false);

if (klsId) {
  form.value.klsId = klsId;
  klsChecked.value = true;
  fetchKLS();
}

const progressWidth = computed(
  () => `${(currentStep.value / totalSteps) * 100}%`
);

const computeShowGWV = computed(() => {
  if (
    (klsFound.value &&
      klsFound.value.klsData &&
      klsFound.value.klsData.residential_units > 1) ||
    form.value.units === null ||
    (form.value.units && form.value.units > 1)
  ) {
    if (
      klsFound.value.positions &&
      klsFound.value.positions.filter((p: any) => p === 16 || p === 28)
        .length === 0
    ) {
      return true;
    }
  }
  return false;
});

// --- Navigation ---
function nextStep() {
  if (currentStep.value === 2) {
    if (!/^\d{12}$/.test(form.value.ordernumber)) {
      addNotification("Ungültige Auftragsnummer", "error", 3000);
      return;
    }
    if (!["connect", "gwv", "bulk"].includes(form.value.orderType)) {
      addNotification("Ungültiger Auftragstyp", "error", 3000);
      return;
    }
  }
  if (currentStep.value < totalSteps) currentStep.value++;
}
function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

function orderCreate() {
  //check ob richtige ausgefüllt
  // checke ob units einen wert zwischen 1 und 50 hat
  if (
    form.value.units !== null &&
    (form.value.units < 1 || form.value.units > 500)
  ) {
    addNotification(
      "Wohneinheiten müssen zwischen 1 und 500 liegen",
      "error",
      3000
    );
    return;
  }
  if (
    (klsFound === null && !form.value.units) ||
    (klsFound && klsFound.klsData && !form.value.units)
  ) {
    addNotification("Wohneinheiten müssen angegeben werden", "error", 3000);
    return;
  }
  if (
    (klsFound === null && !form.value.address) ||
    (klsFound && !klsFound.address && !form.value.address)
  ) {
    addNotification("Adresse muss angegeben werden", "error", 3000);
    return;
  }
  if (
    form.value.orderType === "connect" &&
    computeShowGWV.value &&
    gwvOrderRadio.value === "yes" &&
    !/^\d{12}$/.test(form.value.gwvOrderNumber)
  ) {
    addNotification("Ungültige GWV-Auftragsnummer", "error", 3000);
    return;
  }
  if (
    form.value.orderType === "gwv" &&
    connectOrderRadio.value === "yes" &&
    !/^\d{12}$/.test(form.value.connectOrderNumber)
  ) {
    addNotification("Ungültige Connect-Auftragsnummer", "error", 3000);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        loading.value = true;
        const res = await $fetch("/api/orderCreate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useCookie("jwt").value}`,
          },
          body: JSON.stringify({
            ordernumber: form.value.ordernumber,
            orderType: form.value.orderType,
            gwvOrderNumber:
              form.value.orderType === "connect" &&
              computeShowGWV.value &&
              gwvOrderRadio.value === "yes"
                ? form.value.gwvOrderNumber
                : null,
            connectOrderNumber:
              form.value.orderType === "gwv" &&
              connectOrderRadio.value === "yes"
                ? form.value.connectOrderNumber
                : null,
            units: form.value.units,
            kls_id: form.value.klsId,
            adress: klsFound.address ? klsFound.address : form.value.address,
            latitude: lat,
            longitude: lon,
          }),
        });

        loading.value = false;

        if (res.status === "success") {
          nextStep();
        }
        if (res.status === "error") {
          addNotification(
            res.message || "Fehler beim Anlegen des Auftrags",
            "error",
            5000
          );
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

async function fetchKLS() {
  const result = await useFetch("/api/checkKLS", {
    method: "get",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    params: { kls: form.value.klsId },
  });
  console.log(result.data.value.data);
  klsFound.value = result.data.value.data || null;
}
// --- Dummy-Checks / Platzhalter ---
function checkKls() {
  if (/^\d{7,8}$/.test(form.value.klsId)) {
    klsChecked.value = true;
    fetchKLS();
  } else {
    addNotification("Ungültige KLS-ID", "error");
    klsChecked.value = false;
    klsFound.value = null;
  }
}

function showKlsHistory() {
  console.log("KLS-History anzeigen");
}

function goBackToOrders() {
  console.log("Zurück zu laufenden Aufträgen");
}
</script>

<style scoped>
/* Sanfte Slider-Übergänge */
#background {
  background: linear-gradient(to bottom right, #f8fafc, #eef2ff);
  min-height: 100vh;
}
</style>
