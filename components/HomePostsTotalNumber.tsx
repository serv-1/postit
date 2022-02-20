interface HomePostsTotalNumberProps {
  totalPosts: number
}

const HomePostsTotalNumber = ({ totalPosts }: HomePostsTotalNumberProps) => {
  return totalPosts > 0 ? (
    <span className="fs-3 position-absolute">
      <span className="fw-bold" role="status">
        {totalPosts}
      </span>{' '}
      posts
    </span>
  ) : null
}

export default HomePostsTotalNumber
