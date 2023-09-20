export interface PostsSearchGetData {
  posts: {
    id: string
    name: string
    price: number
    image: string
    address: string
  }[]
  totalPosts: number
  totalPages: number
}

export interface PostsSearchGetError {
  message: string
}
