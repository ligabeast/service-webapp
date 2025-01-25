<template>
  <div class="w-full border border-gray-300 rounded-lg overflow-hidden">
    <!-- Table Header -->
    <div class="bg-gray-100 text-gray-800 font-semibold flex">
      <div class="w-8 px-4 py-2 flex items-center">
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
      </div>
      <div class="flex-1 px-4 py-2">Material</div>
      <div class="flex-1 px-4 py-2">Quantity</div>
      <div class="flex-1 px-4 py-2">Assigned From</div>
      <div class="flex-1 px-4 py-2">Created At</div>
    </div>

    <!-- Table Rows -->
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="flex items-center hover:bg-gray-50 h-12"
    >
      <div class="w-8 h-full border-t border-gray-200 flex items-center px-4">
        <input
          type="checkbox"
          v-model="selected[index]"
          @change="updateSelection"
        />
      </div>
      <div
        class="flex-1 px-4 py-2 border-t border-gray-200 h-full flex items-center"
      >
        <span>{{ item.material }}</span>
      </div>
      <div
        class="flex-1 px-4 py-2 border-t border-gray-200 h-full flex items-center"
      >
        <span>{{ item.quantity }}</span>
      </div>
      <div
        class="flex-1 px-4 py-2 border-t border-gray-200 h-full flex items-center"
      >
        <span>{{ item.assignedFrom }}</span>
      </div>
      <div
        class="flex-1 px-4 py-2 border-t border-gray-200 h-full flex items-center"
      >
        <span>{{ item.createdAt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// Props
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// Emits
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
