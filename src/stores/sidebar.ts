import { apiFetch } from '@/api/apiFetch'
import { defineStore } from 'pinia'

const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: true,
    isSearchActive: false,
  }),
  getters: {},
  actions: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
      localStorage.setItem('isOpen', String(this.isOpen))
    },
    toggleSearch() {
      if (!this.isOpen) this.isOpen = true
      this.isSearchActive = !this.isSearchActive
    },
  },
  persist: {
    storage: localStorage,
  },
})

export default useSidebarStore
