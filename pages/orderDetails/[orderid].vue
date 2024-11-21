<template>
  <div class="flex flex-col space-y-2 pb-4">
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
        <div v-for="position in positions">
          {{ position.quantity ?? "" }} {{ position.position_name }}
        </div>
      </div>
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

    <!-- Buttons -->
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

    <!-- Modal für Bilder -->
    <div
      v-if="showPictureModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 m-0"
    >
      <div class="bg-white rounded-lg w-[90%] max-w-4xl p-4 space-y-4 relative">
        <h2 class="text-xl font-bold">Bilder ansehen</h2>
        <div class="flex items-center justify-between w-full space-x-2">
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
              :src="`${pictures[currentPictureIndex]?.path}?t=${Date.now()}`"
              :alt="
                pictures[currentPictureIndex]?.original_name ||
                'Bildbeschreibung fehlt'
              "
              @click="openFullscreen(pictures[currentPictureIndex]?.path)"
              @load="handleImageLoad"
              @error="handleImageError"
              class="max-h-[60vh] max-w-full object-contain w-full h-auto"
            />

            <p v-else class="text-center text-gray-500">Kein Bild vorhanden</p>
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
    <div ref="fullscreenContainer" class="hidden"></div>
  </div>
</template>

<style scoped>
/* Animationen für das Modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.fixed.inset-0 {
  margin: 0;
  padding: 0;
}
</style>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

// Route und Daten laden
const route = useRoute();
const orderid = route.params.orderid;

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  year: "numeric",
  month: "2-digit",
  minute: "2-digit",
  hour: "2-digit",
});

// Auftrag und Bilder abrufen
const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});

const order = ref<any | null>(data.data[0]);
const pictures = ref<any[]>(data.data[0]?.pictures || []);
console.log(pictures.value);
const validPictures = computed(() =>
  pictures.value.filter(
    (picture: any) => picture && picture.id !== null && picture.path !== null
  )
);

console.log(JSON.stringify(pictures.value));
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

function handleImageLoad() {
  console.log("Bild erfolgreich geladen:", pictures[currentPictureIndex]);
}

function handleImageError() {
  console.error("Fehler beim Laden des Bildes:", pictures[currentPictureIndex]);
}

function setCurrentPicture(index: number) {
  currentPictureIndex.value = index;
}

// Andere Logik (bereits vorhanden, z. B. für Positionen und Dauer)
const positions = computed(() => order.value?.positions);
const orderStarted = ref<any | null>(data.data[0]?.orderCreated);

const formattedDuration = computed(() => {
  if (!orderStarted.value || !order.value) return null;

  const start = new Date(orderStarted.value).getTime();
  const end = new Date(order.value.dateCreated).getTime();
  const durationMs = end - start;

  const totalMinutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
});

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

const fullscreenContainer = ref<HTMLElement | null>(null);

function openFullscreen(imagePath: string) {
  const container = fullscreenContainer.value || document.createElement("div");
  container.innerHTML = `<img src="${imagePath}" alt="Bild im Vollbildmodus" class="max-w-full max-h-full object-contain"/>`;
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.backgroundColor = "black";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.zIndex = "1000";

  // Füge den Container zum DOM hinzu (falls nicht bereits vorhanden)
  if (!fullscreenContainer.value) {
    fullscreenContainer.value = container;
    document.body.appendChild(container);
  }

  // Aktivieren des Fullscreen-Modus
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if ((container as any).webkitRequestFullscreen) {
    // Safari
    (container as any).webkitRequestFullscreen();
  } else if ((container as any).msRequestFullscreen) {
    // IE11
    (container as any).msRequestFullscreen();
  }

  // Schließen des Fullscreen-Modus durch Klicken auf das Bild
  container.addEventListener("click", closeFullscreen);
}

function closeFullscreen() {
  // Schließen des Vollbildmodus
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    // Safari
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    // IE11
    (document as any).msExitFullscreen();
  }

  // Entferne das Bild nach dem Beenden des Fullscreen-Modus
  if (fullscreenContainer.value) {
    fullscreenContainer.value.style.display = "none";
  }
}
</script>
