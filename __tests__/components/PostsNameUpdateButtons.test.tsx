import PostPageUpdateButtons from '../../components/PostPageUpdateButtons'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const getCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const axiosDelete = jest.spyOn(require('axios'), 'delete')

const setToast = jest.fn()
const push = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  useRouter.mockReturnValue({ push })
  getCsrfToken.mockResolvedValue('csrfToken')
})

it('renders', () => {
  render(<PostPageUpdateButtons id="0" name="table" />)

  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', '/posts/0/table/update')

  const editBtn = screen.getByText(/edit/i)
  expect(editBtn).toBeInTheDocument()

  const deleteBtn = screen.getByText(/delete/i)
  expect(deleteBtn).toBeInTheDocument()
})

it('renders as dot buttons', () => {
  render(<PostPageUpdateButtons id="0" name="table" isDotButton />)

  const editBtn = screen.queryByText(/edit/i)
  expect(editBtn).not.toBeInTheDocument()

  const deleteBtn = screen.queryByText(/delete/i)
  expect(deleteBtn).not.toBeInTheDocument()
})

test('the user is redirected to its profile if the post has been deleted', async () => {
  const { rerender } = render(<PostPageUpdateButtons id="0" name="table" />)

  let deleteBtn = screen.getByRole('button', { name: /delete/i })
  await userEvent.click(deleteBtn)

  await waitFor(() => expect(push).toHaveBeenNthCalledWith(1, '/profile'))

  rerender(<PostPageUpdateButtons id="0" name="table" isDotButton />)

  deleteBtn = screen.getByRole('button', { name: /delete/i })
  await userEvent.click(deleteBtn)

  await waitFor(() => expect(push).toHaveBeenNthCalledWith(1, '/profile'))
})

test('an error renders if the server fails to delete the post', async () => {
  axiosDelete.mockRejectedValue({
    response: { data: { message: err.DEFAULT } },
  })
  render(<PostPageUpdateButtons id="0" name="table" />)

  const deleteBtn = screen.getByRole('button', { name: /delete/i })
  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: err.DEFAULT,
      error: true,
    })
  })
})
