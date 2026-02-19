import useAuthStore from '@/stores/auth'

const API_BASE = 'http://localhost:3000'
type UserData = {
  username: string
  password: string
}

export async function loginUser(formData: FormData): Promise<boolean> {
  const user: UserData = {
    username: String(formData.get('username') ?? ''),
    password: String(formData.get('password') ?? ''),
  }
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(user),
    })
    const data = (await response.json()) as {
      accessToken: string
      user: { id: number | string; username: string; email: string }
    }

    const authStore = useAuthStore()
    authStore.setSession(data.accessToken, data.user)
    localStorage.setItem('user', data.user.username)
    return response.ok
  } catch (e) {
    console.log(`Auth Error: ${e}`)
    return false
  }
}
