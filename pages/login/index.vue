<template>
  <div class="p-4 flex flex-col space-y-4">
    <h1 class="font-semibold text-xl pb-10">
      Bitte einloggen um App zu benutzen!
    </h1>
    <div class="flex flex-col space-y-0">
      <label for="username" class="font-medium text-sm">Username</label>
      <input
        type="text"
        class="border border-black rounded-md"
        v-model="username"
        id="username"
        required
      />
    </div>
    <div class="flex flex-col space-y-0">
      <label for="password" class="font-medium text-sm">Password</label>
      <input
        type="password"
        class="border border-black rounded-md"
        v-model="password"
        id="password"
        required
      />
    </div>
    <button
      type="submit"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md h-12 hover:scale-105 transition"
      :disabled="loading"
      @click="login"
    >
      {{ loading ? "Logging in..." : "Login" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();

const login = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Anfrage an das Backend senden
    const data: any = await $fetch("/api/login", {
      method: "POST",
      body: { username: username.value, password: password.value },
    });
    const token = data.data.token;
    const jwtCookie = useCookie("jwt");
    jwtCookie.value = token;

    // Weiterleitung nach erfolgreichem Login
    router.push("/home");
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
};
</script>
