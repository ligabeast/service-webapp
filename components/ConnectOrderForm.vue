<template>
  <MaterialFormModal
    v-show="showMaterialModal"
    @close="showMaterialModal = false"
    @add="handlePushMaterial"
    :materials="possibleMaterials"
  />
  <p class="font-semibold text-lg">Verwendete Materialien:</p>
  <template v-for="material in insertedMaterials" :key="material.id">
    <div class="flex w-full space-x-2 items-center">
      <button class="w-8 h-8" @click="handleDeleteMaterial(material)">
        <svg
          class="w-6 h-6"
          viewBox="0 -0.5 21 21"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>delete [#1487]</title>
          <desc>Created with Sketch.</desc>
          <defs></defs>
          <g
            id="Page-1"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <g
              id="Dribbble-Light-Preview"
              transform="translate(-179.000000, -360.000000)"
              fill="#000000"
            >
              <g id="icons" transform="translate(56.000000, 160.000000)">
                <path
                  d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"
                  id="delete-[#1487]"
                ></path>
              </g>
            </g>
          </g>
        </svg>
      </button>
      <label for="material" class="w-full">{{ material.name }}</label>
      <input
        type="number"
        id="menge"
        class="border border-black w-20 rounded-sm"
        v-model="material.quantity"
      />
    </div>
  </template>
  <template v-if="insertedMaterials.length === 0">
    <p>Keine Materialien eingetragen</p>
  </template>
  <button
    class="w-full h-12 bg-green-500 flex justify-center items-center text-lg font-bold text-white rounded-md"
    @click="showMaterialModal = true"
  >
    Materialien hinzufügen
  </button>
  <button
    class="w-full h-12 bg-blue-500 flex justify-center items-center text-lg font-bold text-white rounded-md"
    @click="handleSave"
  >
    Speichern
  </button>
</template>

<script setup lang="ts">
import type { MaterialResponse } from "~/types";

interface Material {
  id: number;
  name: string;
  quantity: number;
}

const insertedMaterials = ref<Material[]>([]);

const { data, error } = await useFetch<MaterialResponse>(
  "/api/getAllMaterials"
);

if (!data.value) {
  console.error(error.value);
}

const possibleMaterials = ref<{ id: number; name: string }[]>(
  data.value?.status === "success" && data.value.data ? data.value.data : []
);

const showMaterialModal = ref(false);

function handlePushMaterial(material: Material) {
  insertedMaterials.value.push(material);
  showMaterialModal.value = false;
  possibleMaterials.value = possibleMaterials.value.filter(
    (m) => m.id !== material.id
  );
}

function handleDeleteMaterial(material: Material) {
  insertedMaterials.value = insertedMaterials.value.filter(
    (m) => m.id !== material.id
  );
  possibleMaterials.value.push({ id: material.id, name: material.name });
}

function handleSave() {
  // TODO was prüfen?
  if (insertedMaterials.value.length === 0) {
    console.log("Bitte fügen Sie Materialien hinzu");
    return;
  }
}
</script>
