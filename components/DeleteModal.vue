<template>
  <div
    class="fixed -top-0 -left-0 bg-black bg-opacity-50 flex justify-center items-center z-50 h-dvh w-dvw"
  >
    <!-- Modal Box -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-96 relative flex flex-col space-y-2"
    >
      <h1 class="text-xl font-semibold mb-4">
        Sind Sie sicher, dass Sie diesen Auftrag löschen möchten?
      </h1>

      <div class="flex space-x-3">
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition"
          @click="emit('close')"
        >
          Abbrechen
        </button>
        <button
          @click="handleDelete"
          class="bg-blue-500 h-10 w-full rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["close"]);

const router = useRouter();

const props = defineProps<{
  orderid: string;
}>();

function handleDelete() {
  useFetch(`/api/deleteOrder?orderid=${props.orderid}`, {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  }).then((res) => {
    router.push({ name: "ongoingOrders" });
  });
}
</script>
