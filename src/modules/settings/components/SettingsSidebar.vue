<template>
  <nav class="sidebar" aria-label="Settings navigation">
    <router-link
      :to="{ name: 'system' }"
      class="sidebar-link"
      :class="{ active: currentSection === 'system' }"
    >
      <span class="sidebar-link__text">
        {{ $t('title.system_title') }}
      </span>
    </router-link>

    <router-link
      :to="{ name: 'edit' }"
      class="sidebar-link"
      :class="{ active: currentSection === 'edit' }"
    >
      <span class="sidebar-link__text">
        {{ $t('title.edit_title') }}
      </span>
    </router-link>

    <router-link
      :to="{ name: 'userdata' }"
      class="sidebar-link"
      :class="{ active: currentSection === 'userdata' }"
    >
      <span class="sidebar-link__text">
        {{ $t('title.account_title') }}
      </span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentSection = computed(() => String(route.name ?? ''))
</script>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--sidebar-border);
  border-radius: var(--radius-lg);
  background: var(--sidebar-bg);
  box-shadow: var(--card-shadow);
}

.sidebar-link {
  min-height: 46px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--sidebar-item-text);
  background: transparent;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.sidebar-link:hover {
  background: var(--sidebar-item-hover);
  color: var(--icon-primary);
}

.sidebar-link:active {
  transform: scale(0.99);
}

.sidebar-link__text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

.sidebar-link.active {
  background: var(--sidebar-item-active);
  color: var(--sidebar-item-text-active);
  font-weight: 600;
}

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
  }
}
</style>
