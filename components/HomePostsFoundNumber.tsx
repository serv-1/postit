interface HomePostsFoundNumberProps {
  totalPosts: number
}

const HomePostsFoundNumber = ({ totalPosts }: HomePostsFoundNumberProps) => {
  return totalPosts > 0 ? (
    <span className="fs-3 position-absolute">
      <span className="fw-bold" role="status">
        {totalPosts}
      </span>{' '}
      posts
    </span>
  ) : null
}

export default HomePostsFoundNumber
