const API_BASE = 'http://localhost:3000'
type UserData = {
  username: string
  city: string
  email: string
  password: string
}
export async function registerUser(formData: FormData): Promise<boolean> {
  const userData: UserData = {
    username: String(formData.get('username') ?? ''),
    city: String(formData.get('city') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return response.ok
  } catch (e) {
    console.log(`Error: ${e}`)
    return false
  }
}
