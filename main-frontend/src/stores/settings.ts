import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    return {
      isLightTheme: true,
    }
  },
  persist: {
    storage: localStorage,
  },
})
