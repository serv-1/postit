import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostPageContactModal from '.'

const mockSetToast = jest.fn()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('utils/functions/getClientPusher')

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeEach(() => {
  useSession.mockReturnValue({
    data: { channelName: 'test' },
    status: 'authenticated',
  })
})

it('opens/closes', async () => {
  render(<PostPageContactModal postId="0" postName="table" sellerId="0" />)

  const openBtns = screen.getAllByRole('button', { name: /contact/i })
  await userEvent.click(openBtns[0])

  let modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()

  await userEvent.click(openBtns[1])

  modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()
})

it("renders an alert if the user isn't signed in and click on the contact button", async () => {
  useSession.mockReturnValue({ status: 'unauthenticated' })

  render(<PostPageContactModal postId="0" postName="table" sellerId="0" />)

  const openBtn = screen.getAllByRole('button', { name: /contact/i })[0]
  await userEvent.click(openBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()

  expect(mockSetToast.mock.calls[0][0]).toHaveProperty('message')
})
