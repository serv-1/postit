import { render, screen } from '@testing-library/react'
import PostInfos from '../../components/PostInfos'

test('the informations about the post render', () => {
  render(
    <PostInfos
      name="Table"
      description="Magnificent table"
      categories={['furniture', 'cat']}
      price={5000}
      username="John Doe"
    />
  )

  const name = screen.getByRole('heading')
  expect(name).toHaveTextContent('Table')

  const description = screen.getByText('Magnificent table')
  expect(description).toBeInTheDocument()

  const category1 = screen.getByText(/furniture/i)
  expect(category1).toBeInTheDocument()

  const category2 = screen.getByText(/cat/i)
  expect(category2).toBeInTheDocument()

  const price = screen.getByText(/5,000/)
  expect(price).toBeInTheDocument()

  const username = screen.getByText(/john doe/i)
  expect(username).toBeInTheDocument()
})
