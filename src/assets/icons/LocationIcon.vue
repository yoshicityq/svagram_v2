<template>
  <svg
    class="icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
</template>

<style scoped>
.icon-color {
  stroke: var(--icon-primary);
}
.icon {
  color: var(--input-placeholder, #9ca3af);
  pointer-events: none;
  transition: color 0.18s ease;
  flex-shrink: 0;
}
</style>
