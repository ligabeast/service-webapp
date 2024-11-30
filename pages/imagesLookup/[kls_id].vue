<template>
  <div class="flex flex-col space-y-2 pb-4 relative">
    <h1 class="font-semibold text-2xl px-4">KLS History for: {{ klsId }}</h1>
    <h2 class="px-4" v-if="adress">{{ adress }}</h2>
    <Loader v-if="loading" />
    <div v-else-if="orders && orders.length == 0">Keine Aufträge gefunden</div>
    <div v-else>
      <div v-for="order in orders" :key="order.id" class="order bg-gray-200">
        <h2>Auftragsnummer #{{ order.ordernumber }}</h2>
        <p>Auftragsabmeldung: {{ formatDate(order.dateCreated) }}</p>
        <ul style="list-style-type: disc; margin-left: 20px">
          <li v-for="position in order.positions" :key="position.id">
            {{ position.quantity ?? "" }} {{ position.position_name }}
          </li>
        </ul>
        <template v-if="order.pictures && order.pictures.length > 0">
          <div class="image-container flex flex-wrap gap-4">
            <div
              v-for="picture in order.pictures"
              :key="picture.id"
              class="image flex flex-col items-center"
            >
              <img
                :src="picture.path"
                class="w-20 h-20 p-2 border border-black"
                @click="openImageFullscreen(picture.path)"
              />
            </div>
          </div>
          <p>Kommentar: {{ order.commentInternal }}</p>
        </template>
        <div v-else>No images available.</div>
      </div>
    </div>

    <div class="flex items-center justify-center">
      <NuxtLink
        :to="
          orderid
            ? `/orderDetails/${orderid}?currentPage=${currentPage}`
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
    <div
      v-if="fullscreenImage"
      class="fullscreen-modal"
      @click="closeFullscreen"
    >
      <img :src="fullscreenImage" alt="Fullscreen Image" />
    </div>
  </div>
</template>

<script setup>
import { addNotification } from "~/notification";

const route = useRoute();
const klsId = route.params.kls_id;
const currentPage = route.query.currentPage || 1;
const orderid = route.query.orderid || null;

const adress = computed(() => {
  if (!orders.value || orders.value.length == 0) return null;
  return orders.value[0].adress;
});

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const fullscreenImage = ref(null);

const fetchKlsHistory = async () => {
  try {
    const { data } = await useFetch(`/api/getKlsHistory?kls_id=${klsId}`, {
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
      },
    });
    if (data.value.status === "success") {
      orders.value = data.value.data;
      addNotification("KLS History loaded successfully", "success", 5000);
    }
  } catch (err) {
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

onMounted(fetchKlsHistory);
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
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  padding: 0; /* Entfernt jegliches Padding */
}

.fullscreen-modal img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  margin: 0; /* Entfernt Margin */
  padding: 0; /* Entfernt Padding */
  border: none; /* Entfernt unerwünschte Rahmen */
  display: block; /* Stellt sicher, dass keine Inline-Spaces auftreten */
}
</style>
