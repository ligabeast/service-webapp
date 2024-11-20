<template>
  <div class="flex flex-col space-y-2">
    <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Anschrift</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.adress"
        v-html="order?.adress"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">KLS-ID</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.kls_id"
        v-html="order?.kls_id"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsnummer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.ordernumber"
        v-html="order?.ordernumber"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Status</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.status"
        v-html="order?.status"
        :class="{
          'text-green-500': order?.status === 'completed',
        }"
        class="h-90 whitespace-pre-line w-1/2 font-semibold"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsanfang</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="orderStarted"
        v-html="timeFormatter.format(new Date(orderStarted))"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsabmeldung</div>
      <div class="w-[1px] border border-black"></div>
      <div
        v-if="order?.dateCreated"
        v-html="timeFormatter.format(new Date(order?.dateCreated))"
        class="h-90 whitespace-pre-line w-1/2"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Dauer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2"
        v-if="formattedDuration"
        v-html="formattedDuration"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Positions</div>
      <div class="w-[1px] border border-black"></div>
      <div class="w-1/2">
        <div v-for="position in positions" :key="position.id">
          {{ position.quantity ?? "" }} {{ position.position_name }}
        </div>
      </div>
    </div>
    <div class="w-full flex items-center justify-center space-x-3 px-4">
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
    <NuxtLink to="/home" class="flex w-full items-center justify-center">
      <button
        class="bg-blue-500 h-14 w-1/3 rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
      >
        Zurück zum Hauptmenü
      </button>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

// Get the orderid from the route parameters
const route = useRoute();
const orderid = route.params.orderid;

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  year: "numeric",
  month: "2-digit",
  minute: "2-digit",
  hour: "2-digit",
});

const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});

const orderStarted = ref<any | null>(data.data[0].orderCreated);
const order = ref<any | null>(data.data[0]);
const positions = computed(() => order.value?.positions);

console.log("Order catched: ", order.value);
console.log("OrderStarted catched: ", orderStarted.value);
console.log("Positions catched: ", order.value?.positions);

const formattedDuration = computed(() => {
  if (!orderStarted.value || !order.value) return null;

  const start = new Date(orderStarted.value).getTime();
  const end = new Date(order.value.dateCreated).getTime();
  const durationMs = end - start;

  // Calculate hours and minutes
  const totalMinutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format as hh:mm
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
});

const whatsappResult = computed(() => {
  const result = [];
  if (
    order.value.positions.filter(
      (position: any) =>
        position.position_name === "Gf-TA Connect Only" ||
        position.position_name === "Connect mit Herstellen Ne4"
    ).length > 0
  ) {
    result.push("Erledigt und inventarisiert");
  } else if (
    order.value.positions.filter(
      (position: any) =>
        position.position_name === "nicht erledigt - Connect Auftrag"
    ).length > 0
  ) {
    result.push("Connect Nicht Erledigt");
  } else if (
    order.value.positions.filter(
      (position: any) => position.position_name === "GWV Basic"
    ).length > 0
  ) {
    result.push("GWV Erledigt");
  } else if (
    order.value.positions.filter(
      (position: any) =>
        position.position_name === "nicht erledigt - GWV Auftrag"
    ).length > 0
  ) {
    result.push("GWV Nicht Erledigt");
  }
  // join by next line
  return result.join("\n");
});

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

function handleCopyKasys() {
  const text = order.value.positions
    .map((position: any) => {
      if (position.quantity) {
        return position.quantity + " " + position.position_name;
      } else {
        return position.position_name;
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

function getWhatsappFormatt() {
  return (
    order.value.adress +
    "\n" +
    "Auftragsnummer" +
    "\n" +
    order.value.ordernumber +
    "\n" +
    "KLS-ID: " +
    order.value.kls_id +
    "\n" +
    whatsappResult.value
  );
}
</script>
