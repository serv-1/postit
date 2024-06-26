import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import PageWrapper from '.'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import type { UsersIdGetData } from 'app/api/users/[id]/types'

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('next/navigation', () => ({
    usePathname: jest.fn(),
  }))
  .mock('next-auth/react', () => ({
    useSession: jest.fn(),
  }))
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ toast: {}, setToast: mockSetToast }),
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
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json<UsersIdGetData>({
          id: '0',
          name: 'john',
          email: 'john@test.com',
          channelName: 'channelName',
          discussions: [],
          postIds: [],
          favPostIds: [],
        })
      )
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
    rest.get('http://localhost/api/users/:id', () => {
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
    rest.get('http://localhost/api/users/:id', () => {
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
    rest.get('http://localhost/api/users/:id', (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json<UsersIdGetData>({
          id: '0',
          name: 'john',
          email: 'john@test.com',
          channelName: 'channelName',
          discussions: [],
          postIds: [],
          favPostIds: [],
        })
      )
    )
  )

  const { rerender } = render(<PageWrapper>page</PageWrapper>)

  await waitForElementToBeRemoved(() =>
    screen.getByRole('link', { name: /sign in/i })
  )

  server.use(
    rest.get('http://localhost/api/users/:id', () => {
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
    rest.get('http://localhost/api/users/:id', () => {
      throw new Error('should not be called')
    })
  )

  render(
    <PageWrapper
      user={{
        id: '0',
        name: 'john',
        email: 'john@test.com',
        channelName: 'channelName',
        discussions: [],
        postIds: [],
        favPostIds: [],
      }}
    >
      page
    </PageWrapper>
  )
})
