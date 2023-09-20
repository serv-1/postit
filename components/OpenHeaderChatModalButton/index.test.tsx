import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OpenHeaderChatModalButton from '.'
import { setupServer } from 'msw/node'
import userHandlers from 'app/api/user/mock'
import {
  NEXT_PUBLIC_AWS_URL,
  NEXT_PUBLIC_CSRF_HEADER_NAME,
  NEXT_PUBLIC_DEFAULT_USER_IMAGE,
} from 'env/public'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders', async () => {
  const onClick = jest.fn()

  render(
    <OpenHeaderChatModalButton
      onClick={onClick}
      postName="table"
      discussionId="0"
      hasUnseenMessages={false}
      interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
    />
  )

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()

  const img = screen.getByRole('img')

  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/' + 'john.jpeg')
  expect(img).toHaveAttribute('alt', "john's profile picture")

  const interlocutorName = screen.getByText('john')

  expect(interlocutorName).toBeInTheDocument()

  const postName = screen.getByText('table')

  expect(postName).toBeInTheDocument()

  const openBtn = screen.getByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  expect(onClick).toHaveBeenCalledTimes(1)
})

it('renders the default user image', () => {
  render(
    <OpenHeaderChatModalButton
      onClick={() => null}
      postName="table"
      discussionId="0"
      hasUnseenMessages={false}
      interlocutor={{ name: 'john', id: '0' }}
    />
  )

  const img = screen.getByRole('img')

  expect(img).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})

it('renders the notification badge if there is a new message', async () => {
  render(
    <OpenHeaderChatModalButton
      onClick={() => null}
      postName="table"
      discussionId="0"
      hasUnseenMessages
      interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
    />
  )

  const notifBadge = screen.getByRole('status')

  expect(notifBadge).toHaveAttribute('aria-label', 'john has responded')
})

it("removes the discussion from the user's discussion list", async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({ discussionIds: ['0'] }))
    }),
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ discussionId: '0' })

      return res(ctx.status(204))
    })
  )

  render(
    <OpenHeaderChatModalButton
      onClick={() => null}
      postName="table"
      discussionId="0"
      hasUnseenMessages={false}
      interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
    />
  )

  const removeBtn = screen.getByRole('button', { name: /remove/i })

  await userEvent.click(removeBtn)

  expect(removeBtn).not.toBeInTheDocument()
})

it('deletes the discussion if the interlocutor has deleted its account', async () => {
  server.use(
    ...userHandlers,
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({ discussionIds: ['0'] }))
    }),
    rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  render(
    <OpenHeaderChatModalButton
      onClick={() => null}
      postName="table"
      discussionId="0"
      hasUnseenMessages={false}
      interlocutor={{ name: '[DELETED]' }}
    />
  )

  const removeBtn = screen.getByRole('button', { name: /remove/i })

  await userEvent.click(removeBtn)

  expect(removeBtn).not.toBeInTheDocument()
})

it('deletes the discussion if the interlocutor has removed it from its discussion list', async () => {
  server.use(
    ...userHandlers,
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({ discussionIds: [] }))
    }),
    rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  render(
    <OpenHeaderChatModalButton
      onClick={() => null}
      postName="table"
      discussionId="0"
      hasUnseenMessages={false}
      interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
    />
  )

  const removeBtn = screen.getByRole('button', { name: /remove/i })

  await userEvent.click(removeBtn)

  expect(removeBtn).not.toBeInTheDocument()
})

describe('renders an alert if the server fails to', () => {
  test('fetch the interlocutor', async () => {
    server.use(
      rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'error' }))
      })
    )

    render(
      <OpenHeaderChatModalButton
        onClick={() => null}
        postName="table"
        discussionId="0"
        hasUnseenMessages
        interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })

    await userEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  test('update the interlocutor', async () => {
    server.use(
      rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ discussionIds: ['0'] }))
      }),
      rest.put('http://localhost/api/user', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'error' }))
      })
    )

    render(
      <OpenHeaderChatModalButton
        onClick={() => null}
        postName="table"
        discussionId="0"
        hasUnseenMessages
        interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })

    await userEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  test('delete the discussion when the interlocutor has deleted its account', async () => {
    server.use(
      rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'error' }))
      })
    )

    render(
      <OpenHeaderChatModalButton
        onClick={() => null}
        postName="table"
        discussionId="0"
        hasUnseenMessages
        interlocutor={{ name: '[DELETED]' }}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })

    await userEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  test('delete the discussion when the interlocutor has removed it from its discussion list', async () => {
    server.use(
      ...userHandlers,
      rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ discussionIds: [] }))
      }),
      rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'error' }))
      })
    )

    render(
      <OpenHeaderChatModalButton
        onClick={() => null}
        postName="table"
        discussionId="0"
        hasUnseenMessages
        interlocutor={{ name: 'john', image: 'john.jpeg', id: '0' }}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })

    await userEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })
})
