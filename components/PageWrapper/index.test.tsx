import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import PageWrapper from '.'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { UsersIdGetData } from 'app/api/users/[id]/types'
import type { User } from 'types'
import Toast from 'components/Toast'

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const server = setupServer()

const signedInUser: User = {
  _id: '0',
  name: 'john',
  email: 'john@test.com',
  channelName: 'channelName',
  discussions: [],
  postIds: [],
  favPostIds: [],
}

jest
  .mock('next/navigation', () => ({
    usePathname: jest.fn(),
  }))
  .mock('next-auth/react', () => ({
    useSession: jest.fn(),
  }))
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: () => null,
  }))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('render a linear-gradient background if the user is on', () => {
  test('the "authentication" page', () => {
    mockUsePathname.mockReturnValue('/authentication')
    mockUseSession.mockReturnValue({
      status: 'loading',
      data: null,
      update: async () => null,
    })

    const { container } = render(<PageWrapper>page</PageWrapper>)

    expect(container.children[0]).toHaveClass('bg-linear-page')
    expect(container.children[0].children[0]).toHaveClass('mx-auto')
  })

  test('the "create a post" page', () => {
    mockUsePathname.mockReturnValue('/create-a-post')
    mockUseSession.mockReturnValue({
      status: 'loading',
      data: null,
      update: async () => null,
    })

    const { container } = render(<PageWrapper>page</PageWrapper>)

    expect(container.children[0]).toHaveClass('bg-linear-page')
    expect(container.children[0].children[0]).toHaveClass('mx-auto')
  })

  test('the "mail sent" page', () => {
    mockUsePathname.mockReturnValue('/mail-sent')
    mockUseSession.mockReturnValue({
      status: 'loading',
      data: null,
      update: async () => null,
    })

    const { container } = render(<PageWrapper>page</PageWrapper>)

    expect(container.children[0]).toHaveClass('bg-linear-page')
    expect(container.children[0].children[0]).toHaveClass('mx-auto')
  })

  test('the "post update" page', () => {
    mockUsePathname.mockReturnValue(
      '/posts/000000000000000000000000/table/update'
    )

    mockUseSession.mockReturnValue({
      status: 'loading',
      data: null,
      update: async () => null,
    })

    const { container } = render(<PageWrapper>page</PageWrapper>)

    expect(container.children[0]).toHaveClass('bg-linear-page')
    expect(container.children[0].children[0]).toHaveClass('mx-auto')
  })

  test('the "404 not found" page', () => {
    mockUsePathname.mockReturnValue('/not-found')
    mockUseSession.mockReturnValue({
      status: 'loading',
      data: null,
      update: async () => null,
    })

    const { container } = render(<PageWrapper>page</PageWrapper>)

    expect(container.children[0]).toHaveClass('bg-linear-page')
    expect(container.children[0].children[0]).toHaveClass('mx-auto')
  })
})

it("doesn't render the linear-gradient background", () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'loading',
    data: null,
    update: async () => null,
  })

  const { container } = render(<PageWrapper>page</PageWrapper>)

  expect(container.children[0]).not.toHaveClass('bg-linear-page')
  expect(container.children[0].children[0]).not.toHaveClass('mx-auto')
})

it('fetches the authenticated user if it isn\'t on the "authentication" page', async () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { id: '0', channelName: '', expires: '' },
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', ({ params }) => {
      expect(params.id).toBe('0')

      return HttpResponse.json<UsersIdGetData>(signedInUser, { status: 200 })
    })
  )

  render(<PageWrapper>page</PageWrapper>)

  await waitForElementToBeRemoved(() =>
    screen.getByRole('link', { name: /sign in/i })
  )
})

it('doesn\'t fetch the user if it is on the "authentication" page', () => {
  mockUsePathname.mockReturnValue('/authentication')
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { id: '0', channelName: '', expires: '' },
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      throw new Error('should not be called')
    })
  )

  render(<PageWrapper>page</PageWrapper>)
})

it("doesn't fetch the user if is unauthenticated", () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'unauthenticated',
    data: null,
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      throw new Error('should not be called')
    })
  )

  render(<PageWrapper>page</PageWrapper>)
})

it("doesn't fetch the authenticated user twice", async () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { id: '0', channelName: '', expires: '' },
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json<UsersIdGetData>(signedInUser, { status: 200 })
    })
  )

  const { rerender } = render(<PageWrapper>page</PageWrapper>)

  await waitForElementToBeRemoved(() =>
    screen.getByRole('link', { name: /sign in/i })
  )

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      throw new Error('should not be called')
    })
  )

  mockUsePathname.mockReturnValue('/profile')

  rerender(<PageWrapper>page</PageWrapper>)
})

it("doesn't fetch the authenticated user if it is given as a prop", () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { id: '0', channelName: '', expires: '' },
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      throw new Error('should not be called')
    })
  )

  render(<PageWrapper signedInUser={signedInUser}>page</PageWrapper>)
})

it('renders an error if the server fails to fetch the user', async () => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { id: '0', channelName: '', expires: '' },
    update: async () => null,
  })

  server.use(
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <PageWrapper>page</PageWrapper>
      <Toast />
    </>
  )

  const toast = await screen.findByRole('alert')

  expect(toast).toHaveTextContent('error')
})
