<template>
  <div class="validation-group">
    <div class="my-input-wrapper">
      <component :is="icon" class="my-input-icon" />
      <input type="text" class="my-input" :placeholder="placeholder" @input="handleInput($event)" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
  },
  modelValue: {
    type: String,
  },
  icon: {
    type: [Object, Function],
    required: false,
  },
})

const emits = defineEmits(['update:modelValue'])
function handleInput(e: Event) {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="scss">
.my-input-wrapper {
  // position: relative;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);

  display: flex;
  align-items: center;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}
.my-input {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  font: inherit;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.45;
}

.my-input::placeholder {
  color: var(--input-placeholder);
}

.my-input-wrapper:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.my-input:focus {
  outline: none;
  .my-input-wrapper {
    border-color: var(--input-border-active);
    box-shadow: var(--focus-ring);
  }
}

.my-input-icon {
  // position: absolute;
  // left: 14px;
  color: var(--input-placeholder, #9ca3af);
  pointer-events: none;
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.my-input-wrapper:focus-within .my-input-icon {
  color: var(--primary);
}
</style>
