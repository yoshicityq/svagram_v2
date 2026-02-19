<template>
  <div id="portal"></div>
  <div class="main">
    <component :is="layout">
      <div>
        <router-view />
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

const layout = computed(() => route.meta.layout)
</script>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  height: 100%;
}
</style>
