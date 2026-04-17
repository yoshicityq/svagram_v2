import { apiFetch } from '@/api/apiFetch'
import { defineStore } from 'pinia'

const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: true,
    isSearchActive: false,
    unreadCount: 0,
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
    async getUnreadCount() {
      const response = await apiFetch('/notifications/unread-count')
      const data = await response.json()
      this.unreadCount = data.unreadCount
    },
  },
  persist: {
    storage: localStorage,
  },
})

export default useSidebarStore
