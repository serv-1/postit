import { render, screen } from '@testing-library/react'
import ProfilePostsTabPanel from '../../components/ProfilePostsTabPanel'

const useTabs = jest.spyOn(require('../../contexts/tabs'), 'useTabs')

beforeEach(() => useTabs.mockReturnValue({ activeTab: 'post' }))

it('renders without posts', () => {
  render(<ProfilePostsTabPanel posts={[]} />)

  const post = screen.queryByRole('link')
  expect(post).not.toBeInTheDocument()
})

it('renders with posts', () => {
  render(
    <ProfilePostsTabPanel
      posts={[
        {
          id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          name: 'Table',
          description: 'Awesome table',
          categories: ['furniture'],
          price: 50,
          images: ['/table.jpeg'],
        },
      ]}
    />
  )

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/table.jpeg')

  const name = screen.getByText('Table')
  expect(name).toBeInTheDocument()
})
