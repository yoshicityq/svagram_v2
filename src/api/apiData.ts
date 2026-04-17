import type { User } from '@/types/user'
import { apiFetch } from './apiFetch'
import type { Post, PostLikes, PostRating } from '@/types/post'

export async function getProfileImg(username: string): Promise<string | null | undefined> {
  try {
    const response = await apiFetch(`/users/${username}/avatar`)
    if (response) {
      if (response.status === 404) {
        throw new Error('No avatar')
      }
      if (!response.ok) return null
      const blob = await response.blob()
      const imgSource = URL.createObjectURL(blob)
      return imgSource
    }
  } catch (e) {
    console.log(e)
  }
}

type Permission = {
  isOwner: Boolean
  canViewPosts: Boolean
  canViewLikedPosts: Boolean
  canViewRatedPosts: Boolean
}
export async function getProfileData(
  username: string,
): Promise<{ user: User; permissions: Permission } | null> {
  try {
    const response = await apiFetch(`/users/${username}`)

    if (response) {
      const data = await response.json()
      return data
    }
  } catch (e) {
    console.log(e)
  }
  return null
}

export async function getUserPosts(username: string): Promise<Post[] | null> {
  const response = await apiFetch(`/users/${username}/posts`)
  const data = await response.json()
  return data.posts
}
export async function getUserLikedPosts(username: string): Promise<Post[] | null> {
  const response = await apiFetch(`/users/${username}/liked-posts`)
  const data = await response.json()
  return data.posts
}

export async function getUserRatedPosts(username: string): Promise<Post[] | null> {
  const response = await apiFetch(`/users/${username}/rated-posts`)
  const data = await response.json()
  return data.posts
}

export async function getPostLikes(id: number): Promise<PostLikes | null> {
  const res = await apiFetch(`/posts/${id}/likes`)
  const data = await res.json()
  return data
}

export async function getPostRating(id: number): Promise<PostRating | null> {
  const res = await apiFetch(`/posts/${id}/rating`)
  const data = await res.json()
  return data
}
