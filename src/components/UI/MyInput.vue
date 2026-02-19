<template>
  <div>
    <input type="text" class="my-input" :placeholder="placeholder" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
})
</script>

<style scoped lang="scss">
.my-input {
  border: none;
  border-bottom: 1px solid rgb(86, 86, 86);
  padding: 5px 0px;
}

.my-input:focus {
  outline: none;
  border-bottom: 2px solid blueviolet;
}
</style>
