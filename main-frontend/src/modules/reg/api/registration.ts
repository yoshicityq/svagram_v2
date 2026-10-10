const API_BASE = 'http://localhost:3000/users'
type UserData = {
  username: string
  city: string
  email: string
  password: string
}
export async function registerUser(formData: FormData): Promise<boolean> {
  const userData: UserData = {
    email: String(formData.get('email') ?? ''),
    username: String(formData.get('username') ?? ''),
    password: String(formData.get('password') ?? ''),
    city: String(formData.get('city') ?? ''),
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
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
