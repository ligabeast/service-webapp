<template>
  <div class="flex flex-col space-y-2 pb-4 relative h-full w-full">
    <h1 class="font-semibold text-2xl px-4">KLS History for: {{ klsId }}</h1>
    <h2 class="px-4" v-if="adress">{{ adress }}</h2>
    <Loader v-if="loading" />
    <div v-else-if="orders && orders.length == 0">Keine Aufträge gefunden</div>
    <div v-else>
      <div v-for="order in orders" :key="order.id" class="order bg-gray-200">
        <h2>Auftragsnummer #{{ order.ordernumber }}</h2>
        <h2>Techniker: {{ order.username }}</h2>
        <p>Auftragsabmeldung: {{ formatDate(order.dateCreated) }}</p>
        <ul style="list-style-type: disc; margin-left: 20px">
          <li v-for="position in order.positions" :key="position.id">
            {{ position.quantity ?? "" }} {{ position.position_name }}
          </li>
        </ul>
        <template v-if="order.pictures && order.pictures.length > 0">
          <div class="image-container flex flex-wrap gap-4">
            <div
              v-for="(picture, index) in order.pictures"
              :key="picture.id"
              class="image flex flex-col items-center"
            >
              <img
                :src="`${IMAGE_URLPREFIX}${picture?.path}`"
                class="w-20 h-20 p-2 border border-black"
                @click="gallery.openGallery(order.pictures, index)"
              />
            </div>
          </div>
          <p v-if="order.commentInternal">
            Kommentar: {{ order.commentInternal }}
          </p>
        </template>
        <div v-else>No images available.</div>
      </div>
    </div>

    <div class="flex items-center justify-center">
      <NuxtLink
        :to="
          orderid
            ? `/orderDetails/${orderid}?currentPage=${currentPage}`
            : ordernumber
            ? `/postOrder?ordernumber=${ordernumber}&kls_id=${klsId}&adress=${adress}&orderid=${orderid}`
            : `/home?currentPage=${currentPage}`
        "
      >
        <button
          class="bg-blue-500 h-10 w-20 rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
        >
          Zurück
        </button>
      </NuxtLink>
    </div>

    <!-- Fullscreen Image Modal -->
    <FullscreenGallery ref="gallery" />
  </div>
</template>

<script setup>
import { addNotification } from "~/notification";

const route = useRoute();
const klsId = route.params.kls_id;
const ordernumber = route.query.ordernumber;
const adress = route.query.adress;

onMounted(() => {
  console.log("KLS ID:", klsId); // Überprüfen, ob der Wert geladen wird
  fetchKlsHistory();
});

const currentPage = route.query.currentPage || 1;
const orderid = route.query.orderid || null;

const gallery = ref(null);

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const fullscreenImage = ref(null);

const config = useRuntimeConfig();
const IMAGE_URLPREFIX = config.public.IMAGE_URLPREFIX || "localhost";

definePageMeta({
  ssr: false,
});

const fetchKlsHistory = async () => {
  try {
    loading.value = true;
    const response = await $fetch(
      `/api/getKlsHistory?kls_id=${route.params.kls_id}`,
      {
        headers: {
          Authorization: `Bearer ${useCookie("jwt").value}`,
        },
      }
    );

    addNotification(response.message, response.status, 3000);
    if (response.status === "success") {
      orders.value = response.data;
    } else {
      throw new Error(response.message || "Fehler beim Laden der Daten");
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
    error.value = err.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
};

// Formatierungsfunktion für das Datum
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Fullscreen-Bildanzeige
const openImageFullscreen = (imagePath) => {
  fullscreenImage.value = imagePath;
};

// Vollbild schließen
const closeFullscreen = () => {
  fullscreenImage.value = null;
};
</script>

<style scoped>
.order {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 20px;
}
.image img {
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.image img:hover {
  transform: scale(1.05);
}
</style>
