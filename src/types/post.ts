export type Post = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  likes: number
  likedByMe: boolean
  brand_accessory: string | null
  brand_hat: string | null
  brand_outwear: string | null
  brand_bottom: string | null
  brand_shoes: string | null
  brand_bag: string | null
  brand_glasses: string | null
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
