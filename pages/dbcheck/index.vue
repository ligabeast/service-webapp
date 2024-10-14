<template>
  <div>
    <h1>Database status</h1>
    <p>{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
const { data, error } = await useFetch("/api/db-check", {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});
console.log(data);

const status = ref(data);
</script>
