import { defineStore } from 'pinia'

const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: true,
  }),
  getters: {},
  actions: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
    },
  },
})

export default useSidebarStore
