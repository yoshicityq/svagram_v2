import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile-store', {
  state: () => ({
    isOpenedUserOnline: false,
  }),
})
