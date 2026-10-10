<template>
  <div class="auth_layout">
    <language-select class="lang_select" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import LanguageSelect from '@/modules/settings/components/LanguageSelect.vue'
</script>

<style scoped lang="scss">
.auth_layout {
  position: relative;
}
.lang_select {
  position: absolute;
  right: 20px;
  top: 20px;
}
</style>
