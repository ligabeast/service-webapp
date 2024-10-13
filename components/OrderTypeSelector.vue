<template>
  <div class="flex w-full justify-center items-center space-x-5">
    <button
      class="w-32 h-16 border border-blue-500 rounded-xl flex justify-center items-center"
      :style="style.Connect"
      @click="selected = 'Connect'"
    >
      Connect
    </button>
    <button
      class="w-32 h-16 border border-blue-500 rounded-xl flex justify-center items-center"
      :style="style.GWV"
      @click="selected = 'GWV'"
    >
      GWV
    </button>
  </div>
</template>

<script setup lang="ts">
const selected = ref("Connect");
const emit = defineEmits(["changed"]);

watch(selected, (value) => {
  emit("changed", value);
});

const style = computed(() => {
  return {
    Connect: {
      backgroundColor: selected.value === "Connect" ? "#6699CC" : "white",
      color: selected.value === "Connect" ? "white" : "#6699CC",
    },
    GWV: {
      backgroundColor: selected.value === "GWV" ? "#6699CC" : "white",
      color: selected.value === "GWV" ? "white" : "#6699CC",
    },
  };
});
</script>
