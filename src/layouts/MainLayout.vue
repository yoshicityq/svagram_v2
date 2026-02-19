<template>
  <div class="layout">
    <main-sidebar />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import MainSidebar from '@/modules/sidebar/components/MainSidebar.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh; /* Высота 100% экрана */
  width: 100%;
}

.content {
  flex: 1; /* Содержимое занимает доступное пространство */
  overflow-y: auto; /* Позволяет прокручивать содержимое */
  padding: 20px 30px;
}
</style>
