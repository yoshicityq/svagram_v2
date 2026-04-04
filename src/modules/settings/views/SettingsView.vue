<template>
  <div class="settings-view">
    <div class="sub">
      <router-view />
    </div>
    <div class="sb-section">
      <SettingsSidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsSidebar from '../components/SettingsSidebar.vue'
</script>

<style scoped lang="scss">
.settings-view {
  display: flex;
  min-height: calc(100vh - 40px);
}
.sub {
  flex: 1;
  display: flex;
  border-right: 1px solid var(--border-primary);
}
.sb-section {
  width: 300px;
  max-height: 100vh;
  display: flex;
  justify-content: center;
}
</style>
