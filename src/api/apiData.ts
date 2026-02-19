import { apiFetch } from './apiFetch'

export async function getProfileImg(username: string): Promise<string | null> {
  const res = await apiFetch(`/users/${username}/avatar`)
  if (!res.ok) return null
  const blob = await res.blob()
  const imgSource = URL.createObjectURL(blob)
  console.log(imgSource)
  return imgSource
}
