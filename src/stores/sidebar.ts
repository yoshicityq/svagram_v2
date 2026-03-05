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
    },
    toggleSearch() {
      this.isSearchActive = !this.isSearchActive
    },
  },
})

export default useSidebarStore
