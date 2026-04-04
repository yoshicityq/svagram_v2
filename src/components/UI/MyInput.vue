<template>
  <div>
    <input type="text" class="my-input" :placeholder="placeholder" @input="handleInput($event)" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
  },
})

const emits = defineEmits(['update:modelValue'])
function handleInput(e: Event) {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="scss">
.my-input {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  color: var(--text-secondary);
  font: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.my-input::placeholder {
  color: var(--input-placeholder);
}

.my-input:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.my-input:focus {
  outline: none;
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}
</style>
