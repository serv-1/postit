import { render, screen } from '@testing-library/react'
import OpenDiscussionButton from '.'
import {
  NEXT_PUBLIC_AWS_URL,
  NEXT_PUBLIC_CSRF_HEADER_NAME,
  NEXT_PUBLIC_DEFAULT_USER_IMAGE,
} from 'env/public'
import userEvent from '@testing-library/user-event'
import type { Discussion, User } from 'types'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { useSession } from 'next-auth/react'
import Toast from 'components/Toast'

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const server = setupServer()

const discussion: Discussion = {
  _id: '0',
  postName: 'table',
  postId: '1',
  buyerId: '2',
  sellerId: '3',
  channelName: 'discussion channel name',
  messages: [
    { _id: '0', userId: '2', message: 'yo', createdAt: '', seen: true },
  ],
  hasNewMessage: false,
}

const interlocutor: User = {
  _id: '2',
  name: 'john',
  email: 'john@test.com',
  channelName: 'interlocutor channel name',
  postIds: [],
  favPostIds: [],
  discussions: [{ _id: '0', id: '0', hidden: false, hasNewMessage: false }],
}

jest.mock('next-auth/react', () => ({
  getCsrfToken: async () => 'token',
  useSession: jest.fn(),
}))

beforeEach(() => {
  mockUseSession.mockReturnValue({
    data: { id: '3', channelName: '', expires: '' },
    update: async () => null,
    status: 'authenticated',
  })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the interlocutor's name", () => {
  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={interlocutor}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const interlocutorName = screen.getByText('john')
  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorName).toBeInTheDocument()
  expect(interlocutorImage).toHaveAttribute('alt', "john's profile picture")
})

it('renders "deleted" instead of the interlocutor\'s name if the interlocutor is null', () => {
  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={null}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const interlocutorName = screen.getByText('deleted')

  expect(interlocutorName).toBeInTheDocument()
})

it("renders the post's name", () => {
  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={null}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const postName = screen.getByText('table')

  expect(postName).toBeInTheDocument()
})

it("renders the interlocutor's image", () => {
  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={{ ...interlocutor, image: 'john.png' }}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorImage).toHaveAttribute(
    'src',
    NEXT_PUBLIC_AWS_URL + '/john.png'
  )
})

it('renders the default user image', () => {
  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={interlocutor}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorImage).toHaveAttribute(
    'src',
    NEXT_PUBLIC_DEFAULT_USER_IMAGE
  )
})

it('calls the "onOpen" handler on click', async () => {
  const onOpen = jest.fn()

  render(
    <OpenDiscussionButton
      onOpen={onOpen}
      postName="table"
      interlocutor={null}
      discussion={discussion}
      setDiscussion={() => null}
    />
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(onOpen).toHaveBeenCalledTimes(1)
})

it('updates the last unseen message of the discussion when the modal opens', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  const setDiscussion = jest.fn()
  const _discussion: Discussion = {
    ...discussion,
    messages: [
      { _id: '0', userId: '2', message: 'yo', createdAt: '', seen: true },
      { _id: '1', userId: '2', message: 'yo', createdAt: '', seen: false },
    ],
  }

  render(
    <OpenDiscussionButton
      onOpen={() => null}
      postName="table"
      interlocutor={null}
      discussion={_discussion}
      setDiscussion={setDiscussion}
    />
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(setDiscussion).toHaveBeenCalledTimes(1)

  const newDiscussion = setDiscussion.mock.calls[0][0](_discussion)

  expect(newDiscussion.messages.at(-1).seen).toBe(true)
})

it('renders an error if the server fails to update the last unseen message', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  const setDiscussion = jest.fn()
  const _discussion: Discussion = {
    ...discussion,
    messages: [
      { _id: '0', userId: '2', message: 'yo', createdAt: '', seen: true },
      { _id: '1', userId: '2', message: 'yo', createdAt: '', seen: false },
    ],
  }

  render(
    <>
      <OpenDiscussionButton
        onOpen={() => null}
        postName="table"
        interlocutor={null}
        discussion={_discussion}
        setDiscussion={setDiscussion}
      />
      <Toast />
    </>
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
  expect(setDiscussion).not.toHaveBeenCalled()
})
