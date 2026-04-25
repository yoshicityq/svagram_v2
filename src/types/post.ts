export type Post = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  likes: number
  likedByMe: boolean
  category_list: PostPin[]
  date: number
  longitude: number
  latitude: number
  imageUrl: string
}

export type PostLikes = {
  likedByMe: boolean
  likes: number
}

export type PostRating = {
  avgRating: number
  myRating: number | null
  ratingsCount: number
}

export type PostPin = {
  id: string
  xPercent: number
  yPercent: number
  category: string
  brand: string
}
