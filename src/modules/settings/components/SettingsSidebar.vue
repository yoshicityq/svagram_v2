<template>
  <div class="sidebar">
    <router-link :to="{ name: 'system' }">
      <div class="sidebar-section" :class="{ active: currentSection === 'system' }">
        {{ $t('systemSettings.page_title') }}
      </div>
    </router-link>
    <router-link :to="{ name: 'edit' }">
      <div class="sidebar-section" :class="{ active: currentSection === 'edit' }">
        {{ $t('editProfile.page_title') }}
      </div>
    </router-link>

    <router-link :to="{ name: 'userdata' }">
      <div class="sidebar-section" :class="{ active: currentSection === 'userdata' }">
        {{ $t('accountSettings.page_title') }}
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentSection = computed(() => {
  return route.name
})
</script>

<style scoped lang="scss">
.sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  align-self: center;
  justify-content: center;
  padding: 10px 10px;
  border: 2px solid rgba(86, 86, 86, 0.34);
  border-radius: 7px;
  gap: 15px;
  &-section {
    border: 2px solid rgba(86, 86, 86, 0.34);
    padding: 5px 7px;
    border-radius: 10px;
  }
}
.active {
  border-color: blueviolet;
  font-weight: 600;
  background-color: rgba(137, 43, 226, 0.222);
}
</style>
