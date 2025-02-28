<template>
  <div v-if="isFullscreen" class="fullscreen-gallery w-full h-full">
    <!-- Swiper-Galerie -->
    <swiper
      :modules="[Navigation, Pagination]"
      navigation
      :pagination="{ clickable: true }"
      loop
      :initial-slide="initialSlide"
      class="swiper-container"
    >
      <swiper-slide
        @click="closeGallery"
        v-for="(picture, index) in pictures"
        :key="index"
      >
        <img
          :src="`${IMAGE_URLPREFIX}${picture?.path}`"
          alt="Bild"
          class="gallery-image"
        />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

// Galerie-Status
const pictures = ref([]);
const isFullscreen = ref(false);
const initialSlide = ref(0);

const config = useRuntimeConfig();
const IMAGE_URLPREFIX = config.public.IMAGE_URLPREFIX || "localhost";

// Galerie öffnen
const openGallery = (selectedPictures, index = 0) => {
  pictures.value = selectedPictures;
  initialSlide.value = index;
  isFullscreen.value = true;
};

// Galerie schließen
const closeGallery = () => {
  isFullscreen.value = false;
};

// Expose Funktionen für die Elternkomponente
defineExpose({
  openGallery,
});
</script>

<style scoped>
.fullscreen-gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  margin: 0 !important;
  padding: 0;
}

.swiper-container {
  width: 100%;
  height: auto; /* Flexible Höhe */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  margin: 0 auto;
}

/* Querformat: Padding hinzufügen */
@media (orientation: landscape) {
  .gallery-image {
    max-width: 80%; /* Reduziere die Breite für Padding */
    max-height: 80%; /* Reduziere die Höhe für Padding */
    padding: 10px; /* Padding hinzufügen */
  }
}

.swiper-pagination {
  width: auto; /* Automatische Breite */
  height: auto; /* Automatische Höhe */
  margin-top: 10px; /* Abstand zwischen Bild und Pagination */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-pagination-bullet {
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%; /* Runde Punkte */
  opacity: 0.7;
  margin: 0 5px;
  transition: opacity 0.3s;
}

.swiper-pagination-bullet-active {
  opacity: 1;
  background: blue;
}
</style>
