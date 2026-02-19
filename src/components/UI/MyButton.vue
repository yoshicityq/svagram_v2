<template>
  <button class="my-button" :class="`my-button__${color}`">
    <component :is="icon" v-if="icon" />
    <div v-if="isSidebarOpened">
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  icon: {
    type: [Object, Function],
    required: false,
  },
  isSidebarOpened: {
    type: Boolean,
    required: false,
    default: true,
  },
  color: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="scss">
.my-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 5px 10px;
  border: 2px solid blueviolet;
  border-radius: 7px;
  background-color: white;
  color: blueviolet;
  cursor: pointer;
  &__primary {
    background-color: blueviolet;
    color: white;
  }
  &__transparent {
    background-color: transparent;
    color: blueviolet;
    border: none;
  }
}
.my-button__transparent:active {
  background-color: rgba(134, 86, 231, 0.248) !important;
}
.my-button__primary:active {
  background-color: rgb(158, 70, 240) !important;
  border-color: rgb(158, 70, 240) !important;
}
.my-button:active {
  transform: scale(0.9);
  transition: 0.4s ease all;
  box-shadow: 0px 0px 18px 18px rgba(134, 86, 231, 0.248);
  background-color: rgba(230, 230, 230, 0.566);
}
</style>
