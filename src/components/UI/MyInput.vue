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
  border: none;
  border-bottom: 2px solid rgba(111, 111, 111, 0.341);
  padding: 5px 0px;
  width: 100%;
}

.my-input:focus {
  outline: none;
  border-bottom: 2px solid blueviolet;
}
</style>
