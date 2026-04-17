import type { Post, PostLikes, PostRating } from '@/types/post'
import { defineStore } from 'pinia'

const useModalStore = defineStore('modalStore', {
  state: () => ({
    isCreateDialogOpen: false,
    isPostDialogOpen: false,
    isAvatarModalOpen: false,
    openedPostId: null as number | string | null,
    openedPostRating: null as PostRating | null,
    openedPostLikes: null as PostLikes | null,
  }),
  getters: {},
  actions: {
    toggleCreateDialog() {
      this.isCreateDialogOpen = !this.isCreateDialogOpen
    },
    togglePostDialog() {
      this.isPostDialogOpen = !this.isPostDialogOpen
    },
    toggleAvatarModal() {
      this.isAvatarModalOpen = !this.isAvatarModalOpen
    },
  },
})

export default useModalStore
