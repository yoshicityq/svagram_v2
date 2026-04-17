<template>
  <div class="system-view">
    <div class="header">
      <div class="header-text">
        <span class="header-title">{{ $t('title.system_title') }}</span>
        <span class="header-subtitle">{{ $t('description.system_description') }}</span>
      </div>
    </div>

    <div class="body">
      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">{{ $t('title.lang_title') }}</span>
            <span class="setting-description">{{ $t('description.lang_description') }}</span>
          </div>

          <div class="setting-control">
            <LanguageSelect />
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">{{ $t('title.theme_title') }}</span>
            <span class="setting-description">{{ $t('description.theme_description') }}</span>
          </div>

          <div class="setting-control">
            <MySwitcher v-model="theme" :left-icon="SunIcon" :right-icon="MoonIcon" />
          </div>
        </div>

        <!--
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Notifications</span>
            <span class="setting-description">Manage app notifications</span>
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Text size</span>
            <span class="setting-description">Adjust interface font size</span>
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import { useSettingsStore } from '@/stores/settings'
import MySwitcher from '@/components/UI/MySwitcher.vue'
import MoonIcon from '@/assets/icons/utils/MoonIcon.vue'
import SunIcon from '@/assets/icons/utils/SunIcon.vue'

const settingsStore = useSettingsStore()
const theme = computed({
  get() {
    return settingsStore.isLightTheme
  },
  set(val) {
    settingsStore.isLightTheme = val
    localStorage.setItem('isLightTheme', val ? 'light' : 'dark')
  },
})
</script>

<style scoped lang="scss">
.system-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text-primary);
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.body {
  width: 100%;
  display: flex;
  justify-content: center;
}

.settings-card {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-muted);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.setting-description {
  font-size: 13px;
  color: var(--text-soft);
}

.setting-control {
  flex-shrink: 0;
}

.setting-control--placeholder {
  min-height: 42px;
  min-width: 96px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-soft);
}

@media (max-width: 700px) {
  .header-title {
    font-size: 28px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-control {
    width: 100%;
  }
}
</style>
