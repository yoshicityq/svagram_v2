<template>
  <svg
    width="18px"
    height="18px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      :class="`icon__${props.iconType}`"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({
  iconType: {
    type: String,
    default: 'warn',
  },
})
</script>
<style scoped>
.icon__warn {
  stroke: var(--warning);
}
.icon__danger {
  stroke: var(--danger);
}
</style>
