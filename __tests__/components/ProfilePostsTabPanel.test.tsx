import { render, screen } from '@testing-library/react'
import ProfilePostsTabPanel from '../../components/ProfilePostsTabPanel'
import { IUserPost } from '../../types/common'

const useTabs = jest.spyOn(require('../../contexts/tabs'), 'useTabs')

beforeEach(() => useTabs.mockReturnValue({ activeTab: 'post' }))

it('renders without posts', () => {
  render(<ProfilePostsTabPanel posts={[]} />)

  const post = screen.queryByRole('link')
  expect(post).not.toBeInTheDocument()
})

it('renders with posts', () => {
  const post: IUserPost = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'Table',
    description: 'Awesome table',
    categories: ['furniture'],
    price: 50,
    images: ['/table.jpeg'],
  }
  render(<ProfilePostsTabPanel posts={[post]} />)

  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', `/posts/${post.id}/${post.name}/update`)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/table.jpeg')

  const name = screen.getByText('Table')
  expect(name).toBeInTheDocument()
})
