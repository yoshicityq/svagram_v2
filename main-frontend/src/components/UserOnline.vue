<template>
  <div :class="['online-label', { 'online-label--active': isOnline }]" />
</template>

<script setup lang="ts">
defineProps<{
  isOnline: boolean
}>()
</script>

<style scoped>
.online-label {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--icon-muted);
}

.online-label--active {
  background-color: var(--success);
  animation: online-wave 1.4s ease-in-out infinite;
}

@keyframes online-wave {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 45%, transparent);
  }

  70% {
    transform: scale(1.12);
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--success) 0%, transparent);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 0%, transparent);
  }
}
</style>
