interface PostsFoundNumberProps {
  nb: number
}

const PostsFoundNumber = ({ nb }: PostsFoundNumberProps) => {
  return nb > 0 ? (
    <div className="col-span-full text-center my-16" role="status">
      <span className="text-indigo-600">{nb}</span> posts found
    </div>
  ) : null
}

export default PostsFoundNumber
