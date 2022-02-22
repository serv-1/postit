import { Post } from '../types/common'
import Image from 'next/image'
import addCommasToNb from '../utils/functions/addCommasToNb'
import Plus from '../public/static/images/plus.svg'
import PostsListPost from './PostsListPost'

interface ProfilePostsListProps {
  posts: Post[]
}

const ProfilePostsList = ({ posts }: ProfilePostsListProps) => {
  return (
    <div>
      <h2>Your posts</h2>
      {posts.map((post) => (
        <PostsListPost key={post.id} post={post} />
      ))}
    </div>
  )
}

export default ProfilePostsList
