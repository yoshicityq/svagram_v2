import type { Post } from '@/types/post'
import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile-store', {
  state: () => ({
    isOpenedUserOnline: false,
    openedUserId: 0,
    userPosts: [] as Post[],
    userPostsCount: 0,
  }),
})
