export type Post = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  likes: number
  people_liked: string
  brand_h: string
  brand_tt: string
  brand_t: string
  brand_b: string
  brand_s: string
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
