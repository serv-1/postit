import DeleteDiscussionButton from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'

const server = setupServer()
const mockSetToast = jest.fn()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next-auth/react', () => ({
    getCsrfToken: async () => 'token',
  }))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('when clicked', () => {
  describe('if the interlocutor has no discussions', () => {
    it('deletes the discussion', async () => {
      server.use(
        rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
          expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
          expect(req.params.id).toBe('0')

          return res(ctx.status(204))
        })
      )

      render(<DeleteDiscussionButton discussionId="0" />)

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)
    })

    it('renders an error if the server fails to delete the discussion', async () => {
      server.use(
        rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ message: 'error' }))
        })
      )

      render(<DeleteDiscussionButton discussionId="0" />)

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)

      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  describe('if the interlocutor has one or more discussions', () => {
    it('deletes the hidden discussions of the interlocutor', async () => {
      server.use(
        rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
          expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
          expect(req.params.id).toBe('1')

          return res(ctx.status(204))
        })
      )

      render(
        <DeleteDiscussionButton
          discussionId="1"
          interlocutorDiscussions={[
            { _id: '0', id: '0', hidden: false, hasNewMessage: false },
            { _id: '1', id: '1', hidden: true, hasNewMessage: false },
          ]}
        />
      )

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)
    })

    it('renders an error if the server fails to delete the discussions', async () => {
      server.use(
        rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ message: 'error' }))
        })
      )

      render(
        <DeleteDiscussionButton
          discussionId="0"
          interlocutorDiscussions={[
            { _id: '0', id: '0', hidden: true, hasNewMessage: false },
          ]}
        />
      )

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)

      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })

    it('hides the unhidden discussions of the interlocutor', async () => {
      server.use(
        rest.put('http://localhost/api/user', async (req, res, ctx) => {
          expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
          expect(await req.json()).toEqual({ discussionId: '1' })

          return res(ctx.status(204))
        })
      )

      render(
        <DeleteDiscussionButton
          discussionId="1"
          interlocutorDiscussions={[
            { _id: '0', id: '0', hidden: true, hasNewMessage: false },
            { _id: '1', id: '1', hidden: false, hasNewMessage: false },
          ]}
        />
      )

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)
    })

    it('renders an error if the server fails to hide the discussions', async () => {
      server.use(
        rest.put('http://localhost/api/user', async (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ message: 'error' }))
        })
      )

      render(
        <DeleteDiscussionButton
          discussionId="0"
          interlocutorDiscussions={[
            { _id: '0', id: '0', hidden: false, hasNewMessage: false },
          ]}
        />
      )

      const deleteBtn = screen.getByRole('button')

      await userEvent.click(deleteBtn)

      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  it('dispatches a "discussionDeleted" event', async () => {
    server.use(...discussionsIdHandlers)

    render(<DeleteDiscussionButton discussionId="0" />)

    const deleteBtn = screen.getByRole('button')
    const discussionDeletedHandler = jest.fn()

    document.addEventListener('discussionDeleted', discussionDeletedHandler)

    await userEvent.click(deleteBtn)

    expect(discussionDeletedHandler).toHaveBeenCalledTimes(1)
    expect(discussionDeletedHandler.mock.calls[0][0].detail).toBe('0')
  })
})
