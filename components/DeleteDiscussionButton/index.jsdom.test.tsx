import DeleteDiscussionButton from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import Toast from 'components/Toast'
import setup from 'functions/setup'

const server = setupServer()

vi.mock('next-auth/react', () => ({
  getCsrfToken: async () => 'token',
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('deletes the discussion on click', async () => {
  server.use(
    http.put('api/user', () => new HttpResponse(null, { status: 204 })),
  )

  const discussionId = '1'
  const { user } = setup(<DeleteDiscussionButton discussionId={discussionId} />)

  const mockEventCallback = vi.fn()
  document.addEventListener('discussionDeleted', mockEventCallback)

  const button = screen.getByRole('button')
  await user.click(button)

  expect(mockEventCallback).toHaveBeenCalledTimes(1)
  expect(mockEventCallback.mock.calls[0][0].detail).toBe(discussionId)
})

it('renders an error if it fails to delete the discussion on click', async () => {
  server.use(
    http.put('api/user', () =>
      HttpResponse.json({ message: 'error' }, { status: 500 }),
    ),
  )

  const discussionId = '1'
  const { user } = setup(
    <>
      <Toast />
      <DeleteDiscussionButton discussionId={discussionId} />
    </>,
  )

  const mockEventCallback = vi.fn()
  document.addEventListener('discussionDeleted', mockEventCallback)

  const button = screen.getByRole('button')
  await user.click(button)

  const error = screen.getByRole('alert')
  expect(error).toHaveTextContent('error')

  expect(mockEventCallback).not.toHaveBeenCalled()
})
