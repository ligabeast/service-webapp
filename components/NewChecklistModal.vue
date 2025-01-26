<template>
  <div
    class="fixed -top-0 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-40 h-dvh w-dvw overflow-hidden"
    @click="emit('close')"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-2"
      @click.stop
    >
      <div class="flex w-full justify-between">
        <span class="text-xl font-semibold mb-4">Neuen Eintrag hinzufügen</span>

        <div
          class="w-8 h-8 rounded-full hover:bg-gray-200 transition flex items-center justify-center hover:cursor-pointer"
        >
          <button @click="emit('close')" class="w-full h-full">
            <svg
              class="w-full h-full text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0303 8.96965C9.73741 8.67676 9.26253 8.67676 8.96964 8.96965C8.67675 9.26255 8.67675 9.73742 8.96964 10.0303L10.9393 12L8.96966 13.9697C8.67677 14.2625 8.67677 14.7374 8.96966 15.0303C9.26255 15.3232 9.73743 15.3232 10.0303 15.0303L12 13.0607L13.9696 15.0303C14.2625 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2625 15.0303 13.9696L13.0606 12L15.0303 10.0303C15.3232 9.73744 15.3232 9.26257 15.0303 8.96968C14.7374 8.67678 14.2625 8.67678 13.9696 8.96968L12 10.9393L10.0303 8.96965Z"
                fill="currentColor"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <span class="text-xs text-gray-700 font-semibold"
        >Wählen Sie das Material aus</span
      >
      <select
        class="border border-gray-300 rounded-md p-2"
        v-model="selectedMaterial"
        v-if="allMaterials.length > 0"
      >
        <option :value="material.id" v-for="material in allMaterials">
          {{ material.name }}
        </option>
      </select>

      <span class="text-sm font-medium text-gray-600" v-else>
        Kein Material vorhanden
      </span>

      <span v-if="isAdmin" class="text-xs text-gray-700 font-semibold"
        >Wen möchten Sie das Zuweisen?</span
      >
      <select
        class="border border-gray-300 rounded-md p-2"
        v-model="selectedUser"
        v-if="allUsers.length > 0 && isAdmin"
      >
        <option :value="user.id" v-for="user in allUsers">
          {{ user.username }}
        </option>
      </select>

      <div class="flex space-x-3 !mt-6" v-if="allMaterials.length > 0">
        <button
          @click="handleSave"
          class="bg-blue-500 h-10 w-full rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addNotification } from "~/notification";

const props = defineProps({
  isAdmin: Boolean,
  checklist: Array,
});

if (props.isAdmin) {
  fetchAllUsers();
}

const emit = defineEmits(["close", "fetch"]);
const selectedMaterial = ref<string | null>(null);
const allUsers = ref([]);
const selectedUser = ref<string | null>(useState("user").value.userId ?? null);
const data = await useFetch("/api/getAllMaterials", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});
const allMaterials = ref(data.data.value.data ?? []);
async function handleSave() {
  console.log(selectedMaterial.value);
  console.log(props.checklist);
  console.log(selectedUser.value);
  // check if user has already this material
  if (
    props.checklist.some(
      (item) =>
        item.materialid === selectedMaterial.value &&
        item.assignedTo === selectedUser.value
    )
  ) {
    addNotification(
      "Dieses Material wurde bereits hinzugefügt für den Nutzer",
      "error",
      3000
    );
    return;
  }

  const result = await useFetch("/api/addMaterialToChecklist", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
    body: JSON.stringify({
      materialId: selectedMaterial.value,
      userId: selectedUser.value,
    }),
  });
  if (result.data.value.status === "success") {
    addNotification("Material hinzugefügt", "success", 3000);
    emit("fetch");
  } else {
    addNotification("Fehler beim Hinzufügen des Materials", "error", 3000);
  }
  emit("close");
}

function fetchAllUsers() {
  $fetch("/api/getAllUsers", {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  }).then((data) => {
    console.log(data.data);
    allUsers.value = data.data;
    selectedUser.value = data.data.find(
      (user) => user.id === useState("user").value.userId
    ).id;
  });
}
</script>
