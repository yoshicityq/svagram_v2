export type User = {
  id: number
  username: string
  city: string
  description: string
  hasAvatar: boolean
  avatarUrl: string
  favorite_brands: string[]
  title: {
    id: number
    titleName: string
  }
  role: string
}
