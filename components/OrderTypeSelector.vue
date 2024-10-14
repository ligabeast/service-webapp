<template>
  <div class="flex w-full justify-center items-center space-x-5">
    <button
      class="w-32 h-16 border border-blue-500 rounded-xl flex justify-center items-center hover:bg-blue-600 hover:scale-105 transition"
      :style="style.Connect"
      @click="selected = 'connect'"
    >
      Connect
    </button>
    <button
      class="w-32 h-16 border border-blue-500 rounded-xl flex justify-center items-center hover:bg-blue-600 hover:scale-105 transition"
      :style="style.GWV"
      @click="selected = 'gwv'"
    >
      GWV
    </button>
  </div>
</template>

<script setup lang="ts">
const selected = ref("connect");
const emit = defineEmits(["changed"]);

watch(selected, (value) => {
  emit("changed", value);
});

const style = computed(() => {
  return {
    Connect: {
      backgroundColor: selected.value === "connect" ? "#6699CC" : "white",
      color: selected.value === "connect" ? "white" : "#6699CC",
    },
    GWV: {
      backgroundColor: selected.value === "gwv" ? "#6699CC" : "white",
      color: selected.value === "gwv" ? "white" : "#6699CC",
    },
  };
});
</script>
