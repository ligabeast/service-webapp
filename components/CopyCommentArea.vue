<template>
  <div class="flex flex-col space-y-4">
    <div>
      <label class="text-lg font-semibold">Copy Kommentar</label>
      <div class="flex space-x-4 mt-2">
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            value="custom"
            v-model="commentType"
            class="form-radio"
          />
          <span>Freitext</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            value="predefined"
            v-model="commentType"
            class="form-radio"
          />
          <span>Vordefiniert</span>
        </label>
      </div>
    </div>

    <!-- Freitext-Bereich -->
    <div v-if="commentType === 'custom'">
      <label class="text-lg font-semibold" for="kommentar">Freitext</label>
      <textarea
        :value="commentCopy"
        @input="updateComment($event.target.value)"
        class="border border-black rounded-sm h-20 min-h-[5rem] w-full"
      ></textarea>
    </div>

    <!-- Vordefinierte Kommentare -->
    <div v-else>
      <label class="text-lg font-semibold" for="predefined-comment"
        >Vordefinierter Kommentar</label
      >
      <div class="flex space-x-2 items-center">
        <select
          v-model="selectedPredefinedComment"
          class="border border-black rounded-sm w-full"
          @change="() => emit('update:commentCopy', selectedPredefinedComment)"
        >
          <option
            v-for="comment in predefinedComments"
            :key="comment"
            :value="comment"
          >
            {{ comment }}
          </option>
        </select>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          @click="addPredefinedComment"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { addNotification } from "~/notification";
import type { OrderResponse } from "~/types";

const emit = defineEmits(["update:commentCopy"]);

defineProps({
  commentCopy: String,
});

const { data, error } = await useFetch<OrderResponse>(
  "/api/getPredefinedComments",
  {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  }
);
const predefinedComments = ref<string[]>(data.value.data.map((e) => e.comment));

// Zustand verwalten
const commentType = ref<"custom" | "predefined">("predefined");
const selectedPredefinedComment = ref("");

const updateComment = (newComment: string) => {
  emit("update:commentCopy", newComment);
};

// Neuen vordefinierten Kommentar hinzufügen
const addPredefinedComment = () => {
  const newComment = prompt("Bitte geben Sie einen neuen Kommentar ein:");
  if (newComment) {
    predefinedComments.value.push(newComment);
    selectedPredefinedComment.value = newComment;
    $fetch("/api/addNewPredefinedComment", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: newComment }),
    }).then((res) => {
      addNotification(res.message, res.status, 3000);
    });
  }
};
</script>

<style scoped>
/* Optional: Styling für die Radiobuttons */
.form-radio {
  accent-color: #1d4ed8; /* Tailwind Blue */
}
</style>
