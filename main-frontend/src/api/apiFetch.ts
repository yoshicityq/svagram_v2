import useAuthStore from '@/stores/auth'
import { refreshAccessToken } from '@/modules/auth/api/refresh'

const API_BASE = 'http://localhost:3000'

export async function apiFetch(path: string, init: RequestInit = {}) {
  const auth = useAuthStore()
  const url = `${API_BASE}${path}`

  const makeRequest = async () => {
    const headers = new Headers(init.headers)

    if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)

    const isFormData = init.body instanceof FormData
    if (init.body && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    return fetch(url, { ...init, headers, credentials: 'include' })
  }

  let res = await makeRequest()

  if (res.status === 401) {
    try {
      await refreshAccessToken()
      res = await makeRequest()
    } catch {
      auth.clearSession?.()
      auth.accessToken = null
      auth.user = null
    }
  }

  return res
}
