import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OpenHeaderChatModalButton from '../../components/OpenHeaderChatModalButton'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'
const defaultUserImage = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE

const props = {
  onClick: () => null,
  hasUnseenMessages: false,
  interlocutor: { name: 'jane', image: 'keyName', id: '1' },
  postName: 'table',
  csrfToken: 'token',
  discussionId: '0',
}
const interlocutor = {
  id: '1',
  name: 'jane',
  email: 'jane@ja.ne',
  image: 'keyName',
  discussionsIds: ['0'],
  posts: ['0'],
  favPosts: [],
  channelName: 'test',
  hasUnseenMessages: false,
}

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPut = jest.spyOn(require('axios'), 'put')
const axiosDelete = jest.spyOn(require('axios'), 'delete')

const setToast = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  axiosGet.mockResolvedValue({ data: interlocutor })
  axiosPut.mockResolvedValue({})
  axiosDelete.mockResolvedValue({})
})

it('renders', async () => {
  const onClick = jest.fn()

  render(<OpenHeaderChatModalButton {...{ ...props, onClick }} />)

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', awsUrl + 'keyName')
  expect(img).toHaveAttribute('alt', "jane's profile picture")

  const interlocutorName = screen.getByText('jane')
  expect(interlocutorName).toBeInTheDocument()

  const postName = screen.getByText('table')
  expect(postName).toBeInTheDocument()

  const openBtn = screen.getByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  expect(onClick).toHaveBeenCalledTimes(1)
})

it('renders the default user image', () => {
  const p = { ...props, interlocutor: { name: 'jane', id: '1' } }
  render(<OpenHeaderChatModalButton {...p} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', defaultUserImage)
})

it('renders a notification badge if there is a new message', async () => {
  render(
    <OpenHeaderChatModalButton {...{ ...props, hasUnseenMessages: true }} />
  )

  const notifBadge = screen.getByRole('status')
  expect(notifBadge).toHaveAttribute('aria-label', 'jane has responded')
})

it("removes the discussion from the user's discussionsIds after a click on the remove button", async () => {
  render(<OpenHeaderChatModalButton {...props} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    expect(axiosGet).toHaveBeenNthCalledWith(1, '/api/users/1')

    expect(axiosPut).toHaveBeenCalledTimes(1)
    const payload = { discussionId: '0', csrfToken: 'token' }
    expect(axiosPut.mock.calls[0][1]).toEqual(payload)
  })

  expect(removeBtn).not.toBeInTheDocument()
})

it('deletes the discussion if the interlocutor has deleted its account after a click on the remove button', async () => {
  const interlocutor = { name: '[DELETED]', image: 'default.jpeg' }

  render(<OpenHeaderChatModalButton {...{ ...props, interlocutor }} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    expect(axiosPut).toHaveBeenCalledTimes(1)
    const payload = { discussionId: '0', csrfToken: 'token' }
    expect(axiosPut.mock.calls[0][1]).toEqual(payload)

    const url = '/api/discussions/0?csrfToken=token'
    expect(axiosDelete).toHaveBeenNthCalledWith(1, url)
  })

  expect(axiosGet).not.toHaveBeenCalled()
})

it('deletes the discussion if the interlocutor has not the discussion id after a click on the remove button', async () => {
  axiosGet.mockResolvedValue({ data: { ...interlocutor, discussionsIds: [] } })

  render(<OpenHeaderChatModalButton {...props} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    expect(axiosGet).toHaveBeenNthCalledWith(1, '/api/users/1')

    expect(axiosPut).toHaveBeenCalledTimes(1)
    const payload = { discussionId: '0', csrfToken: 'token' }
    expect(axiosPut.mock.calls[0][1]).toEqual(payload)

    const url = '/api/discussions/0?csrfToken=token'
    expect(axiosDelete).toHaveBeenNthCalledWith(1, url)
  })
})

it('renders an alert if the server fails to fetch the interlocutor', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<OpenHeaderChatModalButton {...props} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('renders an alert if the server fails to update the interlocutor', async () => {
  axiosPut.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<OpenHeaderChatModalButton {...props} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('renders an alert if the server fails to delete the discussion', async () => {
  axiosGet.mockResolvedValue({ data: { ...interlocutor, discussionsIds: [] } })
  axiosDelete.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<OpenHeaderChatModalButton {...props} />)

  const removeBtn = screen.getByRole('button', { name: /remove/i })
  await userEvent.click(removeBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
