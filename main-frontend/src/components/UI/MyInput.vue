<template>
  <div class="validation-group">
    <div
      class="my-input-wrapper"
      :class="{ active: isActive }"
      @focusin="isActive = true"
      @focusout="isActive = false"
    >
      <component v-if="type === 'default'" :is="icon" class="my-input-icon" />
      <input
        type="text"
        class="my-input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput($event)"
      />
      <component
        v-if="type === 'comment'"
        :is="icon"
        class="my-comment-icon"
        color="blueviolet"
        @click="sendComm"
      />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  type: {
    type: String,
    required: false,
  },
})
const isActive = ref<boolean>(false)

const emits = defineEmits(['update:modelValue', 'sendComm'])
function handleInput(e: Event) {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
}
function sendComm() {
  emits('sendComm')
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
.my-input-wrapper.active {
  box-shadow: var(--focus-ring);

  border-color: var(--input-border-active);
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
.my-comment-icon {
  transition: color 0.18s ease;
  flex-shrink: 0;
  width: 40px;
  cursor: pointer;
}
.my-input-wrapper:focus-within .my-input-icon {
  color: var(--primary);
}
</style>
