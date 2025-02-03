<template>
  <div class="w-full border border-gray-300 rounded-lg">
    <!-- Table Header -->
    <div
      class="bg-gray-100 text-gray-800 font-semibold flex justify-center items-center w-full"
    >
      <div class="w-8 flex-grow px-4 py-2 flex items-center">
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-sm w-28 text-center"
      >
        Material
      </div>
      <div
        class="flex flex-grow justify-center items-center px-4 py-2 text-sm w-32 text-center"
      >
        Erzeugt am
      </div>
    </div>

    <!-- Table Rows -->
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="flex hover:bg-gray-50 min-h-12 relative"
    >
      <div
        class="w-8 flex-grow h-full border-t border-gray-200 flex items-center px-4 py-2"
      >
        <input
          type="checkbox"
          v-model="selected[index]"
          @change="updateSelection"
        />
      </div>
      <div
        class="w-28 flex-grow px-4 py-2 border-t border-gray-200 h-full flex items-center justify-center space-x-2"
        v-if="!edits[index]"
      >
        <span class="text-gray-700 text-xs">{{ item.name }}</span>
        <button
          class="rounded border border-gray-400 hover:bg-gray-200 transition p-1 w-8 h-8 flex items-center jusitfy-center"
          @click="handleEdit(index)"
        >
          <svg
            class="w-5 h-5 text-black"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div
        class="w-28 flex-grow px-4 py-2 border-t border-gray-200 h-full flex flex-col md:flex-row md:space-y-0 md:space-x-2 items-center justify-center space-y-2 min-h-12"
        v-else
      >
        <input
          v-model="item.name"
          class="w-40 text-xs px-2 focus:outline-none border border-gray-300 rounded h-8"
        />
        <button
          class="rounded border text-white text-sm font-semibold border-gray-400 transition p-1 w-24 h-full flex items-center justify-center"
          @click="handleSave(index)"
          :class="{
            'bg-blue-500 hover:bg-blue-600 ':
              itemsCopy[index].name !== item.name,
            'bg-gray-400 cursor-default': itemsCopy[index].name === item.name,
          }"
          :disabled="itemsCopy[index].name === item.name"
        >
          speichern
        </button>
        <button
          class="rounded border text-white text-sm font-semibold border-gray-400 transition p-1 w-24 h-full flex items-center justify-center bg-gray-500 hover:bg-gray-600"
          @click="
            edits[index] = false;
            item.name = itemsCopy[index].name;
          "
        >
          abbrechen
        </button>
      </div>
      <div
        class="w-32 flex-grow px-4 py-2 border-t border-gray-200 h-full flex items-center justify-center"
      >
        <span class="text-gray-700 text-xs text-center">{{
          dateFormatter(item.createdAt)
        }}</span>
      </div>
    </div>
    <div
      class="w-full flex items-center justify-center py-3"
      v-if="props.items.length === 0"
    >
      <span class="text-bold text-gray-500 text-sm"
        >Keine Daten eingetragen</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { addNotification } from "~/notification";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// deep copy of the items
const itemsCopy = ref(JSON.parse(JSON.stringify(props.items)));

watch(
  () => props.items,
  (newItems) => {
    console.log("newItems", newItems);

    itemsCopy.value = JSON.parse(JSON.stringify(newItems));
  },
  { immediate: true }
);

const edits = ref(new Array(props.items.length).fill(false));

function handleEdit(index: number) {
  // stop editing other rows
  edits.value.forEach((_, i) => {
    if (i !== index) {
      edits.value[i] = false;
    }
  });

  // toggle editing of the clicked row
  edits.value[index] = !edits.value[index];
}

async function handleSave(index: number) {
  const res = await $fetch("/api/changeMaterialName", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    body: JSON.stringify({
      newName: props.items[index].name,
      materialId: props.items[index].id,
    }),
  });
  addNotification(res.message, res.status, 500);

  if (res.status === "success") {
    edits.value[index] = false;
    itemsCopy.value[index].name = props.items[index].name;
  }
}

watch(
  () => props.items, // Was überwacht werden soll
  (newItems, oldItems) => {
    selected.value = new Array(newItems.length).fill(false);
  }
);

const dateFormatter = (date: Date | string): string => {
  const d = new Date(date);

  // Formatierung der einzelnen Teile
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Monat ist 0-basiert
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  // Zusammenfügen im gewünschten Format
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const emit = defineEmits(["updateSelection"]);

const selected = ref(new Array(props.items.length).fill(false));

const allSelected = computed(() => selected.value.every((val) => val));

function toggleAll() {
  const newValue = !allSelected.value;
  selected.value = new Array(props.items.length).fill(newValue);
  emitSelectedIds();
}

function updateSelection() {
  emitSelectedIds();
}

function emitSelectedIds() {
  const selectedIds = props.items
    .filter((_, index) => selected.value[index]) // Filter selected items
    .map((item) => item.id); // Map to their IDs
  emit("updateSelection", selectedIds); // Emit selected IDs
}
</script>
