<script setup lang="ts">
const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])
// function updateSelect(e: Event ) {
//   emit('update:modelValue', e.target.value)
// }
</script>

<template>
  <select :value="modelValue" @change="" class="select">
    <option disabled selected value="">Выберите бренд</option>
    <option>Gucci</option>
    <option>Cav Empt</option>
    <option>Goyard</option>
    <option>Nike</option>
  </select>
</template>

<style scoped>
.select {
  padding: 3px 5px;
  border: 1px solid hsl(226, 11%, 37%);
}
.select:focus {
  outline: none;
}
</style>
