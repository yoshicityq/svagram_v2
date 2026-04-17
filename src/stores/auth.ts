import { apiFetch } from '@/api/apiFetch'
import { closeWs, connectWs } from '@/services/ws'
import { useNotification } from '@kyvg/vue3-notification'
import { defineStore } from 'pinia'

type User = {
  id: string | number
  username: string
  email: string
}
type UserAvatar = {
  hasAvatar: boolean
  avatarUrl: string | null
}
const { notify } = useNotification()
const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
    avatarData: null as UserAvatar | null,
    isReady: false,
  }),
  getters: {
    isAuth: (state) => !!state.accessToken,
  },
  actions: {
    setSession(accessToken: string, user: User) {
      this.accessToken = accessToken
      this.user = user
    },
    clearSession() {
      this.accessToken = null
      this.user = null
      closeWs()
    },
    async init() {
      try {
        // если токена нет — сначала refresh
        if (!this.accessToken) {
          const r = await fetch('http://localhost:3000/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          })
          if (!r.ok) {
            this.clearSession()
            return
          }
          const data = (await r.json()) as { accessToken: string }
          this.accessToken = data.accessToken
        }

        // теперь можно /me
        const res = await apiFetch('/me')
        if (res.ok) {
          const data = (await res.json()) as { user: User }
          this.user = data.user
          connectWs()
        } else {
          this.clearSession()
        }
      } finally {
        this.isReady = true
      }
    },
  },
})

export default useAuthStore
