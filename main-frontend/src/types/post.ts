export type Post = {
  user: UserData
  content: PostData
  stats: StatsData
}
export type UserData = {
  username: string
  id: number
}
export type PostData = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  likes: number
  likedByMe: boolean
  categoryList: PostPin[]
  date: number
  longitude: string
  latitude: string
  imageUrl: string
}
export type StatsData = {
  likesCount: number
  peopleLiked: number[]
  avgRating: number
  ratingsCount: number
  myRating: number | null
  likedByMe: boolean
  commentsCount: number
  // commentsCount: number;
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

export type PostComment = {
  commentData: CommentData
  userData: CommentUserData
}

export type CommentUserData = {
  userId: number
  username: string
  avatarUrl: string | null
}

export type CommentData = {
  id: number
  postId: number
  text: string
  createdAt: string
  updatedAt: string | null
  parentCommentId: number | null
  isMine: boolean
}
