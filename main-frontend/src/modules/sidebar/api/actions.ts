import useAuthStore from '@/stores/auth'

const API_BASE = 'http://localhost:3000'

export async function logoutUser(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    const authStore = useAuthStore()
    authStore.accessToken = null
    authStore.user = null

    return response.ok
  } catch (e) {
    console.log(`Error: ${e}`)
    return false
  }
}
