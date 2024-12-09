<template>
  <div v-if="isFullscreen" class="fullscreen-gallery">
    <!-- Swiper-Galerie -->
    <swiper
      :modules="[Navigation, Pagination]"
      navigation
      pagination
      loop
      :initial-slide="initialSlide"
      class="swiper-container"
    >
      <swiper-slide
        @click="closeGallery"
        v-for="(picture, index) in pictures"
        :key="index"
      >
        <img :src="picture.path" alt="Bild" class="gallery-image" />
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
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.gallery-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
