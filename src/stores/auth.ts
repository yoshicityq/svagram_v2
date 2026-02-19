import { apiFetch } from '@/api/apiFetch'
import { defineStore } from 'pinia'

type User = {
  id: number | string
  username: string
  email: string
}

const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
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
