import addCommasToNb from '../utils/functions/addCommasToNb'

interface PostInfosProps {
  name: string
  description: string
  categories: string[]
  username: string
  price: number
}

const PostInfos = (props: PostInfosProps) => {
  const { name, categories, description, username, price } = props

  return (
    <div className="col">
      <div className="row">
        <div className="col-md-9">
          <h2 className="text-break">{name}</h2>
          <div>
            {categories.map((category) => (
              <span
                key={category}
                className="d-inline-block border border-1 border-dark rounded px-1 m-1"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
        <div className="col text-end">
          <span className="fs-4 fw-bold">{addCommasToNb(price)}€</span>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col position-relative">
          <div
            className="px-2 border border-2 border-dark"
            style={{ backgroundColor: '#EEE' }}
          >
            <div
              className="position-absolute translate-middle-y fst-italic px-2"
              style={{
                backgroundImage: 'linear-gradient(to top, #EEE 50%, #FFF 50%)',
              }}
            >
              <span className="fw-bold">{username}</span> says
            </div>
            <p className="py-2 m-0">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostInfos
