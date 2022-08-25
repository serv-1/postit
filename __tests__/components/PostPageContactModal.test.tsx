import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostPageContactModal from '../../components/PostPageContactModal'
import getClientPusher from '../../utils/functions/getClientPusher'

jest.mock('../../utils/functions/getClientPusher')

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

const setToast = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  useSession.mockReturnValue({
    data: { channelName: 'test' },
    status: 'authenticated',
  })

  const subscribe = () => ({ bind: () => null, unbind: () => null })
  ;(getClientPusher as jest.Mock).mockReturnValue({ subscribe })
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
  useSession.mockReturnValue({
    data: { channelName: 'test' },
    status: 'unauthenticated',
  })

  render(<PostPageContactModal postId="0" postName="table" sellerId="0" />)

  const openBtn = screen.getAllByRole('button', { name: /contact/i })[0]
  await userEvent.click(openBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()

  expect(setToast.mock.calls[0][0]).toHaveProperty('message')
})
