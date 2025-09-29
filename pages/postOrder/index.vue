<template>
  <div class="flex w-full h-full flex-col p-4">
    <h1 class="font-semibold text-2xl text-center">Auftrag abschließen</h1>
    <Loader v-if="showLoading" />
    <CabelModal
      v-show="showCabelModal"
      @abort="showCabelModal = false"
      @submit="handleSave2"
    />
    <DeckenModal
      v-show="showDeckenModal"
      @abort="
        showDeckenModal = false;
        showCabelModal = false;
      "
      @submit="handleSave3"
    />
    <StundensatzModal
      v-show="showStundensatzModal"
      @abort="
        showStundensatzModal = false;
        showDeckenModal = false;
        showCabelModal = false;
      "
      @submit="handleSave4"
    />
    <DoppelauftragModal
      v-show="showDoppelauftragModal"
      @abort="
        showDoppelauftragModal = false;
        showStundensatzModal = false;
        showDeckenModal = false;
        showCabelModal = false;
      "
      @submit="handleSave5"
    />
    <DarkBg
      v-show="showCabelModal || showDeckenModal || showStundensatzModal"
      @abort="
        showStundensatzModal = false;
        showCabelModal = false;
        showDeckenModal = false;
      "
    />
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
    <ResultModal1
      v-if="showResultModal1"
      @next="
        showResultModal1 = false;
        showResultModal2 = true;
      "
      :commentCopy="commentCopy"
      :insertedPositions="insertedPositions"
      :selectedOrderType="selectedOrderType"
      :adress="adress"
      :ordernumber="ordernumber"
      :notCompletedReason="notCompletedReason"
      :kls_id="kls_id"
      :ne3error="{
        ne3error: ne3error,
        ne3errorRemoved: ne3errorRemoved,
      }"
    />
    <ResultModal2
      v-if="showResultModal2"
      @next="
        showResultModal2 = false;
        showResultModal3 = true;
      "
      :commentCopy="commentCopy"
      :insertedPositions="insertedPositions"
      :selectedOrderType="selectedOrderType"
      :adress="adress"
      :ordernumber="ordernumber"
      :notCompletedReason="notCompletedReason"
      :kls_id="kls_id"
      :ne3error="{
        ne3error: ne3error,
        ne3errorRemoved: ne3errorRemoved,
      }"
    />
    <ResultModal3
      v-if="showResultModal3"
      @home="
        router.push('/home');
        showResultModal3 = false;
      "
      :commentCopy="commentCopy"
      :insertedPositions="insertedPositions"
      :selectedOrderType="selectedOrderType"
      :adress="adress"
      :ordernumber="ordernumber"
      :notCompletedReason="notCompletedReason"
      :kls_id="kls_id"
      :ne3error="{
        ne3error: ne3error,
        ne3errorRemoved: ne3errorRemoved,
      }"
    />
    <div class="flex w-full h-full flex-col space-y-4">
      <label for="anschrift">Anschrift</label>
      <textarea
        v-model="adress"
        id="anschrift"
        class="border border-black rounded-sm h-20 min-h-[5rem] w-full"
        disabled
      ></textarea>

      <div class="flex space-x-3">
        <label for="anschrift" class="w-1/2">Auftragsnummer</label>
        <span class="text-gray-600 font-medium">{{ ordernumber }}</span>
      </div>
      <div class="flex space-x-3">
        <label for="anschrift" class="w-1/2">KLS-ID</label>
        <NuxtLink
          class="underline text-blue-600"
          :to="`/imagesLookup/${kls_id}?ordernumber=${ordernumber}&adress=${adress}`"
          >{{ kls_id }}</NuxtLink
        >
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
          <label for="material" class="w-full"
            >{{
              material.description
                ? material.alias + " (" + material.description + ")"
                : material.alias
            }}
          </label>
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

      <!-- Select reason for not completed Order -->
      <div class="flex flex-col space-y-4" v-if="notCompleted">
        <label class="text-lg font-semibold" for="reason"
          >Grund für nicht abgeschlossenen Auftrag</label
        >
        <select
          v-model="notCompletedReason"
          v-if="selectedOrderType == 'connect'"
          class="border border-black rounded-sm w-full h-8 px-2"
        >
          <option>Kunde nicht vorort</option>
          <option>Zugang nicht vorhanden</option>
          <option>Vertragsfehler</option>
          <option>Neuer Termin vereinbart</option>
          <option>Leitungsweg nicht realisierbar</option>
          <option>GWV nicht vorhanden</option>
          <option>AP nicht ZTV-Konform gebaut</option>
          <option>Sonstiges</option>
        </select>
        <select
          v-model="notCompletedReason"
          v-if="selectedOrderType == 'gwv'"
          class="border border-black rounded-sm w-full h-8 px-2"
        >
          <option>Kunde nicht vorort</option>
          <option>Zugang nicht vorhanden</option>
          <option>Vertragsfehler</option>
          <option>Neuer Termin vereinbart</option>
          <option>Leitungsweg nicht realisierbar</option>
          <option>AP nicht vorhanden</option>
          <option>AP nicht ZTV-Konform gebaut</option>
          <option>Sonstiges</option>
        </select>
      </div>

      <div
        class="flex flex-col space-y-4"
        v-if="
          selectedOrderType == 'connect' &&
          insertedPositions.find((e) => e.id === 14)
        "
      >
        <label class="text-lg font-semibold" for="reason"
          >Wie viele Wohneinheiten(WE), hat das Objekt?</label
        >
        <div class="flex space-x-2 items-center">
          <label for="we1" class="select-none">1</label>
          <input
            name="we"
            id="we1"
            type="radio"
            value="1"
            v-model="weInObject"
          />
        </div>
        <div class="flex space-x-2 items-center">
          <label for="we2-3" class="select-none">2-3</label>
          <input
            name="we"
            id="we2-3"
            type="radio"
            value="2-3"
            v-model="weInObject"
          />
        </div>
        <div class="flex space-x-2 items-center">
          <label for="we4+" class="select-none">4+</label>
          <input
            name="we"
            id="we4+"
            type="radio"
            value="4+"
            v-model="weInObject"
          />
        </div>
      </div>

      <div
        class="flex flex-col space-y-4"
        v-if="
          selectedOrderType == 'connect' &&
          insertedPositions.find((e) => e.id === 14)
        "
      >
        <label class="text-lg font-semibold" for="reason"
          >Hast du nach AKP gebaut?</label
        >
        <div class="flex space-x-2 items-center">
          <label for="akpyes" class="select-none"
            >Ja / AKP nicht vorhanden</label
          >
          <input name="akp" id="akpyes" type="radio" value="Ja" v-model="akp" />
        </div>
        <div class="flex space-x-2 items-center">
          <label for="akpno" class="select-none">Nein</label>
          <input
            name="akp"
            type="radio"
            id="akpno"
            value="Nein"
            v-model="akp"
          />
        </div>
      </div>

      <div
        class="flex flex-col space-y-4"
        v-if="selectedOrderType == 'connect'"
      >
        <label class="text-lg font-semibold" for="reason"
          >Ne3 Fehler vorhanden?</label
        >
        <div class="flex space-x-2 items-center">
          <label for="n3no" class="select-none">Nein</label>
          <input
            name="ne3"
            id="n3no"
            type="radio"
            value="Nein"
            v-model="ne3error"
          />
        </div>
        <div class="flex space-x-2 items-center">
          <label for="n3yes" class="select-none">Ja</label>
          <input
            name="ne3"
            id="n3yes"
            type="radio"
            value="Ja"
            v-model="ne3error"
          />
        </div>
      </div>
      <div
        class="flex flex-col space-y-4"
        v-if="ne3error === 'Ja' && selectedOrderType === 'connect'"
      >
        <label class="text-lg font-semibold" for="reason"
          >Ne3 Fehler beseitigt?</label
        >
        <div class="flex space-x-2 items-center">
          <label for="ne3Removedno" class="select-none">Nein</label>
          <input
            name="ne3Removed"
            id="ne3Removedno"
            type="radio"
            value="Nein"
            v-model="ne3errorRemoved"
          />
        </div>
        <div class="flex space-x-2 items-center">
          <label for="n3Removedyes" class="select-none">Ja</label>
          <input
            name="ne3Removed"
            id="n3Removedyes"
            type="radio"
            value="Ja"
            v-model="ne3errorRemoved"
          />
        </div>
      </div>

      <div class="flex flex-col space-y-4">
        <label class="text-lg font-semibold" for="kommentar"
          >Interner Kommentar</label
        >
        <textarea
          v-model="commentInternal"
          class="border border-black rounded-sm h-20 min-h-[5rem] w-full"
        ></textarea>
      </div>
      <CopyCommentArea v-model:commentCopy="commentCopy" />
      <button
        class="w-full h-12 bg-blue-500 flex justify-center items-center text-lg font-bold text-white rounded-md hover:bg-blue-600 hover:scale-105 transition min-h-10"
        @click="handleSave"
        :disabled="showLoading"
      >
        Speichern
      </button>
      <button
        class="w-full h-12 bg-gray-400 flex justify-center items-center text-lg font-bold text-white rounded-md hover:bg-gray-500 hover:scale-105 transition min-h-10"
        @click="showDeleteModal = true"
      >
        Löschen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaterialResponse, Material } from "~/types";
import { addNotification } from "~/notification.ts";

const selectedOrderType = ref<string>("connect");

const showDeleteModal = ref(false);

const route = useRoute();

const router = useRouter();

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

const commentCopy = ref<string>("");
const commentInternal = ref<string>("");

const notCompleted = ref<boolean>(false);
const notCompletedReason = ref<string>("");

const weInObject = ref<string>("2-3");
const akp = ref<string>("Ja");
const showDoppelauftragModal = ref(false);

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
const showResultModal1 = ref(false);
const showResultModal2 = ref(false);
const showResultModal3 = ref(false);
const showLoading = ref(false);
const showCabelModal = ref(false);
const showDeckenModal = ref(false);
const notCompletedFroze = ref(false);
const showStundensatzModal = ref(false);
const ne3error = ref<string>("Nein");
const ne3errorRemoved = ref<string>("Nein");

function handlePushMaterial(material: Material) {
  insertedPositions.value.push(material);
  showMaterialModal.value = false;
  possibleMaterials.value = possibleMaterials.value.filter(
    (m) => m.id !== material.id
  );
  if (material.id === 15 || material.id === 17) {
    notCompleted.value = true;
    notCompletedFroze.value = true;
  } else {
    notCompletedFroze.value = false;
    notCompleted.value = false;
  }
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
  if (material.id === 15 || material.id === 17) {
    notCompletedFroze.value = false;
    notCompleted.value = false;
  }
}

async function handleSave() {
  if (notCompleted.value && !notCompletedReason.value) {
    addNotification(
      "Bitte geben Sie einen Grund für den nicht abgeschlossenen Auftrag an",
      "error",
      5000
    );
    return;
  }

  if (
    notCompletedReason.value &&
    notCompletedReason.value === "Sonstiges" &&
    !commentCopy.value
  ) {
    addNotification(
      "Bitte geben Sie einen Grund(Copy Kommentar) für den nicht abgeschlossenen Auftrag an",
      "error",
      5000
    );
    return;
  }

  if (insertedPositions.value.length === 0) {
    console.log("Bitte fügen Sie Positionen hinzu");
    addNotification(
      "Bitte fügen Sie mindestens eine Position hinzu",
      "error",
      5000
    );
    return;
  }

  // check ob Kabel eingetragen ist
  const kabel = insertedPositions.value.find((e) => e.id === 21);

  if (!kabel) {
    showCabelModal.value = true;
    return;
  }
  handleSave2();
}

function handleSave2() {
  // check ob Durchbruch eingetragen ist
  const durchbruch = insertedPositions.value.find((e) => e.id === 27);

  if (!durchbruch) {
    showDeckenModal.value = true;
    return;
  }
  handleSave3();
}

function handleSave3() {
  // check ob Stundensatz eingetragen ist
  const stundensatz = insertedPositions.value.find((e) => e.id === 24);

  if (
    ne3error &&
    ne3error.value === "Ja" &&
    (!stundensatz || (stundensatz && stundensatz.quantity < 2))
  ) {
    showStundensatzModal.value = true;
    return;
  }
  handleSave4();
}

function handleSave4() {
  if (
    selectedOrderType.value === "connect" &&
    weInObject.value === "2-3" &&
    insertedPositions.value.find((e) => e.id == 19 || e.id == 20)
  ) {
    showDoppelauftragModal.value = true;
    return;
  }
  handleSave5();
}

async function handleSave5() {
  const formData = new FormData();

  // Dateien anhängen
  if (files.value && files.value.length > 0) {
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i];
      console.log(`Hinzufügen von Datei: ${file.name}, Größe: ${file.size}`);
      const compressedFile = await compressImage(file, 0.7);
      formData.append("pictures", compressedFile);
    }
  } else {
    console.error("Keine Dateien in files.value gefunden.");
  }

  // Weitere Felder anhängen
  formData.append("weInObject", weInObject.value);
  formData.append("akp", akp.value);
  formData.append("notCompleted", notCompleted.value.toString());
  formData.append("notCompletedReason", notCompletedReason.value);
  formData.append("ordernumber", ordernumber.value);
  formData.append("orderid", orderid);
  formData.append("orderType", selectedOrderType.value);
  formData.append("commentCopy", commentCopy.value);
  formData.append(
    "ne3error",
    JSON.stringify({
      ne3error: ne3error.value,
      ne3errorRemoved: ne3errorRemoved.value,
    })
  );
  formData.append("commentCopy", commentCopy.value);
  formData.append("commentInternal", commentInternal.value);
  formData.append(
    "positions",
    JSON.stringify(
      insertedPositions.value.map((e) => ({
        position_id: e.id,
        quantity: e.quantity,
        description: e.description,
      }))
    )
  );

  console.log("FormData-Inhalt:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  // Anfrage senden
  showLoading.value = true;
  $fetch("/api/orderComplete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
      // Kein "Content-Type", da $fetch dies bei FormData automatisch setzt
    },
    body: formData, // FormData direkt senden
  })
    .then((res) => {
      addNotification(res.message, res.status, 3000);
      showLoading.value = false;
      console.log("Antwort:", res);
      if (res.status === "success") {
        showResultModal1.value = true;
        showCabelModal.value = false;
        showDeckenModal.value = false;
        showStundensatzModal.value = false;
        showDoppelauftragModal.value = false;
        commentCopy.value = res.data.commentCopy;
      }
    })
    .catch((error) => {
      console.error("Fehler beim Speichern:", error);
    });
}

async function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Datei ist kein Bild"));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return reject(new Error("Canvas konnte nicht erstellt werden."));
        }

        // Größe des Bildes setzen
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Bild in JPEG umwandeln und komprimieren
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Ursprünglichen Namen ohne Endung extrahieren
              const originalNameWithoutExtension = file.name
                .split(".")
                .slice(0, -1)
                .join(".");

              // Neuen Dateinamen mit .jpg-Endung erstellen
              const newName = `${originalNameWithoutExtension}.jpg`;

              // Komprimiertes File-Objekt erstellen
              const compressedFile = new File([blob], newName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Fehler bei der Bildkomprimierung."));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
</script>
