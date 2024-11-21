<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <h1 class="font-semibold text-2xl text-center">Auftrag abschließen</h1>
    <PositionInsertModal
      v-show="showMaterialModal"
      @close="showMaterialModal = false"
      @add="handlePushMaterial"
      :materials="possibleMaterials"
    />
    <DeleteModal
      v-if="showDeleteModal"
      :orderid="orderid"
      @close="showDeleteModal = false"
    />
    <ResultModal
      v-if="showResultModal"
      @close="showResultModal = false"
      :insertedPositions="insertedPositions"
      :adress="adress"
      :ordernumber="ordernumber"
      :kls_id="kls_id"
    />
    <label for="anschrift">Anschrift</label>
    <textarea
      v-model="adress"
      id="anschrift"
      class="border border-black rounded-sm h-20"
      disabled
    ></textarea>

    <div class="flex space-x-3">
      <label for="anschrift" class="w-1/2">Auftragsnummer</label>
      <input
        v-model="ordernumber"
        type="text"
        class="w-full border border-black rounded-sm"
        disabled
      />
    </div>
    <div class="flex space-x-3">
      <label for="anschrift" class="w-1/2">KLS-ID</label>
      <input
        type="text"
        v-model="kls_id"
        class="w-full border border-black rounded-sm"
        disabled
      />
    </div>
    <OrderTypeSelector @changed="selectedOrderType = $event" />
    <p class="font-semibold text-lg">Hochgeladene Bilder</p>
    <input
      type="file"
      accept="image/png, image/jpeg, image/jpg"
      multiple
      @change="onFileChange"
    />
    <p class="font-semibold text-lg">Eingetragene Positionen:</p>
    <template v-for="material in insertedPositions" :key="material.id">
      <div class="flex w-full space-x-2 items-center">
        <button
          class="w-8 h-8 hover:scale-105 transition"
          @click="handleDeleteMaterial(material)"
        >
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
        <label for="material" class="w-full">{{ material.alias }}</label>
        <input
          type="number"
          id="menge"
          inputmode="numeric"
          pattern="[0-9]*"
          v-if="material.dynamic"
          class="border border-black w-20 rounded-sm"
          v-model="material.quantity"
        />
      </div>
    </template>
    <template v-if="insertedPositions.length === 0">
      <p>Keine Positionen eingetragen</p>
    </template>
    <div class="w-full flex h-12 items-center justify-center">
      <button
        class="w-20 h-12 bg-green-500 flex justify-center items-center text-2xl font-bold text-white rounded-md hover:bg-green-600 hover:scale-105 transition"
        @click="showMaterialModal = true"
      >
        +
      </button>
    </div>
    <button
      class="w-full h-12 bg-blue-500 flex justify-center items-center text-lg font-bold text-white rounded-md hover:bg-blue-600 hover:scale-105 transition"
      @click="handleSave"
    >
      Speichern
    </button>
    <button
      class="w-full h-12 bg-gray-400 flex justify-center items-center text-lg font-bold text-white rounded-md hover:bg-gray-500 hover:scale-105 transition"
      @click="showDeleteModal = true"
    >
      Löschen
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MaterialResponse, Material } from "~/types";
import { addNotification } from "~/notification.ts";

const selectedOrderType = ref<string>("Connect");

const showDeleteModal = ref(false);

const route = useRoute();

const files = ref<null | FileList>(null);

const ordernumberRef = route.query.ordernumber as string | undefined;
const kls_idRef = route.query.kls_id as string | undefined;
const adressRef = route.query.adress as string | undefined;
const orderid = route.query.orderid as string;

// Definiere die Refs für deine Daten
const insertedPositions = ref<Material[]>([]);
const adress = ref<string>(adressRef ?? ""); // Fallback auf leeren String, falls adress undefined ist
const kls_id = ref<string>(kls_idRef ?? "");
const ordernumber = ref<string>(ordernumberRef ?? "");

watch(selectedOrderType, (value) => {
  if (selectedOrderType.value === "gwv") {
    possibleMaterials.value = (allPositions.value?.data as any).filter(
      (m) => m.type === "gwv" || m.type === "both"
    );
  } else if (selectedOrderType.value === "connect") {
    possibleMaterials.value = (allPositions.value?.data as any).filter(
      (m) => m.type === "connect" || m.type === "both"
    );
  }
  if (allPositions.value?.data) {
    possibleMaterials.value = (allPositions.value?.data as any).filter(
      (m) => m.type == selectedOrderType.value || m.type == "both"
    );
    insertedPositions.value = [];
  }
});

const { data: allPositions, error } = await useFetch<MaterialResponse>(
  "/api/getAllPositions",
  {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  }
);

if (!allPositions.value) {
  console.error(error.value);
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (target && target.files) {
    files.value = target.files;
  }
};

const possibleMaterials = ref<Material[]>(
  allPositions.value?.status === "success" && allPositions.value.data
    ? allPositions.value.data
        .filter((e) => e.type === "connect" || e.type === "both") // Filter based on type
        .map((e) => e as Material) // Map the filtered items to Material
    : []
);

const showMaterialModal = ref(false);
const showResultModal = ref(false);

function handlePushMaterial(material: Material) {
  insertedPositions.value.push(material);
  showMaterialModal.value = false;
  possibleMaterials.value = possibleMaterials.value.filter(
    (m) => m.id !== material.id
  );
}

function handleDeleteMaterial(material: Material) {
  insertedPositions.value = insertedPositions.value.filter(
    (m) => m.id !== material.id
  );
  possibleMaterials.value.push({
    id: material.id,
    name: material.name,
    alias: material.alias,
    dynamic: material.dynamic,
    quantity: material.quantity,
    type: material.type,
  });
}

function handleSave() {
  if (insertedPositions.value.length === 0) {
    console.log("Bitte fügen Sie Positionen hinzu");
    return;
  }

  const formData = new FormData();

  // Dateien anhängen
  if (files.value && files.value.length > 0) {
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i];
      console.log(`Hinzufügen von Datei: ${file.name}, Größe: ${file.size}`);
      formData.append("pictures", file); // Nutze "pictures" als Schlüssel
    }
  } else {
    console.error("Keine Dateien in files.value gefunden.");
  }

  // Weitere Felder anhängen
  formData.append("ordernumber", ordernumber.value);
  formData.append("orderid", orderid);
  formData.append("orderType", selectedOrderType.value);
  formData.append(
    "positions",
    JSON.stringify(
      insertedPositions.value.map((e) => ({
        position_id: e.id,
        quantity: e.quantity,
      }))
    )
  );

  console.log("FormData-Inhalt:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  // Anfrage senden
  $fetch("/api/orderComplete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
      // Kein "Content-Type", da $fetch dies bei FormData automatisch setzt
    },
    body: formData, // FormData direkt senden
  })
    .then((res) => {
      addNotification(res.message, res.status, 5000);
      console.log("Antwort:", res);
      showResultModal.value = true;
    })
    .catch((error) => {
      console.error("Fehler beim Speichern:", error);
    });
}
</script>
