import useAuthStore from '@/stores/auth'

const API_BASE = 'http://localhost:3000'

export async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Refresh failed')

  const data = (await res.json()) as { accessToken: string }
  const authStore = useAuthStore()
  authStore.accessToken = data.accessToken // или auth.setAccessToken(...)
  return data.accessToken
}
