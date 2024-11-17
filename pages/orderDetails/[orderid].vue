<template>
  <div class="flex flex-col space-y-2">
    <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>

    <!-- Auftrag Details -->
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

    <!-- Bilder ansehen -->
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Bilder</div>
      <div class="w-[1px] border border-black"></div>
      <a
        v-if="validPictures.length && validPictures.length > 0"
        @click="openPictureModal"
        class="w-1/2 cursor-pointer text-blue-600 font-semibold hover:text-blue-700 underline transition"
        >{{ validPictures.length }} Bilder hochgeladen</a
      >
      <span v-else class="w-1/2">Keine Bilder hochgeladen</span>
    </div>

    <!-- Modal für Bilder -->
    <div
      v-if="showPictureModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg w-[90%] max-w-4xl p-4 space-y-4 relative">
        <h2 class="text-xl font-bold">Bilder ansehen</h2>
        <div class="flex items-center justify-between w-full">
          <!-- Linker Button -->
          <button
            class="text-xl font-bold bg-gray-200 p-2 rounded-md flex-shrink-0"
            @click="prevPicture"
            :disabled="currentPictureIndex === 0"
          >
            &lt;
          </button>

          <!-- Bild -->
          <div class="flex-grow flex items-center justify-center">
            <img
              v-if="pictures[currentPictureIndex]?.path"
              :src="pictures[currentPictureIndex]?.path"
              :alt="pictures[currentPictureIndex]?.original_name"
              class="max-h-[60vh] max-w-full object-contain"
            />
            <img v-else src="/no-image.png" alt="Kein Bild vorhanden" />
          </div>

          <!-- Rechter Button -->
          <button
            class="text-xl font-bold bg-gray-200 p-2 rounded-md flex-shrink-0"
            @click="nextPicture"
            :disabled="currentPictureIndex === pictures.length - 1"
          >
            &gt;
          </button>
        </div>
        <div class="flex justify-center space-x-2">
          <span
            v-for="(picture, index) in pictures"
            :key="picture.id"
            :class="{
              'bg-blue-500': currentPictureIndex === index,
              'bg-gray-300': currentPictureIndex !== index,
            }"
            class="h-2 w-2 rounded-full cursor-pointer"
            @click="setCurrentPicture(index)"
          ></span>
        </div>
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-md w-full"
          @click="closePictureModal"
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

// Route und Daten laden
const route = useRoute();
const orderid = route.params.orderid;

// Auftrag abrufen
const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});

const order = ref<any | null>(data.data[0]);
const pictures = ref<any[]>(data.data[0]?.pictures || []);

// Computed Property für valide Bilder
const validPictures = computed(() =>
  pictures.value.filter(
    (picture: any) => picture && picture.id !== null && picture.path !== null
  )
);

const currentPictureIndex = ref(0);
const showPictureModal = ref(false);

// Bilder-Steuerung
function openPictureModal() {
  showPictureModal.value = true;
}

function closePictureModal() {
  showPictureModal.value = false;
}

function nextPicture() {
  if (currentPictureIndex.value < pictures.value.length - 1) {
    currentPictureIndex.value++;
  }
}

function prevPicture() {
  if (currentPictureIndex.value > 0) {
    currentPictureIndex.value--;
  }
}

function setCurrentPicture(index: number) {
  currentPictureIndex.value = index;
}

// Kopierlogik für WhatsApp
function handleCopyWhatsapp() {
  const text = `${order.value.adress}\nAuftragsnummer\n${order.value.ordernumber}\nKLS-ID: ${order.value.kls_id}`;
  copyToClipboard(text);
}

// Kopierlogik für Kasys
function handleCopyKasys() {
  const text = order.value.positions
    .map((position: any) =>
      position.quantity
        ? `${position.quantity} ${position.position_name}`
        : position.position_name
    )
    .join("; ");
  copyToClipboard(text);
}

// Universelle Kopierfunktion
function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Fehler beim Kopieren:", err);
    });
  } else {
    // Fallback für ältere Browser
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
