<template>
  <div
    class="fixed -top-0 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-50 h-dvh w-dvw"
    @click="emit('close')"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-5"
      @click.stop
    >
      <div class="flex flex-row items-center justify-between">
        <p class="text-xl font-semibold">Position Hinzufügen</p>
        <button class="text-2xl font-bold px-2" @click="handleClose">
          <svg
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z"
              fill="#292D32"
            />
          </svg>
        </button>
      </div>
      <template v-if="transProps.length === 0">
        <p>Alle verfügbaren Positionen sind bereits hinzugefügt.</p>
      </template>
      <template v-else>
        <div class="flex items-center">
          <label for="material" class="w-1/4">Position </label>
          <select
            id="material"
            class="border border-black text-lg text-bold w-3/4 text-black text-center"
            v-model="selectedMaterial"
          >
            <option
              v-for="material in transProps"
              :key="material.id"
              :value="material"
            >
              {{ material.alias }}
            </option>
          </select>
        </div>

        <div
          v-if="selectedMaterial && selectedMaterial.dynamic"
          class="flex items-center"
        >
          <label for="menge" class="w-1/4">Menge </label>
          <input
            type="number"
            id="menge"
            class="border border-black w-20 text-center"
            inputmode="numeric"
            pattern="[0-9]*"
            v-model="quantity"
          />
        </div>
        <div v-if="selectedMaterial && selectedMaterial.id == 21">
          <div class="flex items-center">
            <label for="material" class="w-1/4 text-xs">Beschreibung</label>
            <select
              id="material"
              class="border border-black text-lg text-bold w-3/4 text-black text-center"
              v-model="description"
            >
              <option value="TA zu SP">TA->SP</option>
              <option value="SP zu AP">SP->AP</option>
              <option value="TA zu AP">TA->AP</option>
            </select>
          </div>
        </div>
        <button
          class="bg-green-500 rounded-md h-10 w-full text-white font-bold hover:bg-green-600 hover:scale-105 transition mt-2"
          @click="handleSubmit"
        >
          Bestätigen
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addNotification } from "~/notification";

const props = defineProps<{
  materials: { id: number; name: string; alias: string }[];
}>();

const transProps = computed(() => {
  return props.materials.filter((e) => e.hide != 1);
});
const emit = defineEmits(["close", "add"]);
const selectedMaterial = ref<{
  id: number;
  name: string;
  dynamic: boolean;
  alias: string;
} | null>(null);
const quantity = ref<number | null>(null);
const description = ref<string | null>(null);

watch(selectedMaterial, (value) => {
  description.value = null;
  quantity.value = null;
});

function handleSubmit() {
  if (
    selectedMaterial.value &&
    selectedMaterial.value.id == 21 &&
    !description.value
  ) {
    addNotification("Bitte Beschreibung auswählen", "error", 3000);
    return;
  }
  if (
    selectedMaterial.value &&
    selectedMaterial.value.dynamic &&
    !quantity.value
  ) {
    addNotification("Bitte Menge eingeben", "error", 3000);
    return;
  }
  if (selectedMaterial.value) {
    emit("add", {
      ...selectedMaterial.value,
      quantity: quantity.value,
      description: description.value,
    });
    selectedMaterial.value = null;
    quantity.value = null;
  }
}

function handleClose() {
  emit("close");
  selectedMaterial.value = null;
  quantity.value = null;
}
</script>

<style scoped>
/* Optional: Verhindert Scrollen des Hintergrunds, wenn Modal geöffnet ist */
body {
  overflow: hidden;
}
select,
option {
  color: black; /* Schwarze Schriftfarbe auch beim ausgewählten Element */
}
</style>
