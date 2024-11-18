<template>
  <div class="flex flex-col space-y-2">
    <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>

    <!-- Auftrag Details -->
    <!-- ... Unveränderte Abschnitte ... -->

    <!-- Bilder ansehen -->
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Bilder</div>
      <div class="w-[1px] border border-black"></div>
      <div class="w-1/2">
        <div class="grid grid-cols-3 gap-2">
          <!-- Bildliste -->
          <img
            v-for="(picture, index) in validPictures"
            :key="picture.id"
            :src="picture.path"
            :alt="picture.original_name || 'Bildbeschreibung fehlt'"
            class="cursor-pointer rounded-md shadow object-cover h-20 w-full hover:scale-105 transition"
            @click="
              setCurrentPicture(index);
              openPictureModal();
            "
          />
        </div>
      </div>
    </div>

    <!-- Modal für Bilder -->
    <div
      v-if="showPictureModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
    >
      <div class="relative w-full max-w-4xl">
        <!-- Aktuelles Bild -->
        <img
          v-if="pictures[currentPictureIndex]?.path"
          :src="pictures[currentPictureIndex]?.path"
          :alt="
            pictures[currentPictureIndex]?.original_name ||
            'Bildbeschreibung fehlt'
          "
          class="max-h-screen max-w-full object-contain mx-auto"
        />

        <!-- Schließen-Button -->
        <button
          class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
          @click="closePictureModal"
        >
          Schließen
        </button>

        <!-- Navigation -->
        <button
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-200 text-gray-800 p-3 rounded-full shadow hover:bg-gray-300"
          @click="prevPicture"
          :disabled="currentPictureIndex === 0"
        >
          &lt;
        </button>
        <button
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 text-gray-800 p-3 rounded-full shadow hover:bg-gray-300"
          @click="nextPicture"
          :disabled="currentPictureIndex === pictures.length - 1"
        >
          &gt;
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

// Andere Logik bleibt unverändert...
</script>

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
</style>
