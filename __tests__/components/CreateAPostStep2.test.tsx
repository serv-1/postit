import CreateAPostStep2 from '../../components/CreateAPostStep2'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IImage } from '../../types/common'
import selectEvent from 'react-select-event'
import err from '../../utils/constants/errors'

const axiosPost = jest.spyOn(require('axios'), 'post')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const router = { push: jest.fn() }

beforeEach(() => {
  axiosPost.mockResolvedValue({})
  useRouter.mockReturnValue(router)
  useToast.mockReturnValue({})
})

const images: IImage[] = [{ base64: 'azerty', ext: 'jpg' }]
const latLon: [number, number] = [42, 48]

it('has the "hidden" class if the given step isn\'t its step', () => {
  render(<CreateAPostStep2 images={images} step={0} setStep={() => null} />)

  const container = screen.getByTestId('step2')
  expect(container).toHaveClass('hidden')
})

test('the "Back" button passes to the previous step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep2 images={images} step={2} setStep={setStep} />)

  const backBtn = screen.getByRole('button', { name: /back/i })
  await userEvent.click(backBtn)
  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})

test('the user is redirected to its profile after a valid submission', async () => {
  render(
    <CreateAPostStep2
      csrfToken="csrf"
      images={images}
      latLon={latLon}
      step={2}
      setStep={() => null}
    />
  )

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText(/categories/i)
  // https://github.com/romgain/react-select-event/issues/97
  selectEvent.openMenu(categoriesSelect)
  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(axiosPost).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/post',
      {
        csrfToken: 'csrf',
        name: 'Modern table',
        description: 'A magnificent modern table.',
        categories: ['furniture'],
        price: 40,
        images,
        latLon,
      }
    )
    expect(router.push).toHaveBeenNthCalledWith(1, '/profile')
  })
})

test('an error renders if the server fails to create the post', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })
  axiosPost.mockRejectedValue({ response: { data: { message: err.DEFAULT } } })

  render(
    <CreateAPostStep2
      csrfToken="csrf"
      images={images}
      latLon={latLon}
      step={2}
      setStep={() => null}
    />
  )

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText('Categories')
  // https://github.com/romgain/react-select-event/issues/97
  selectEvent.openMenu(categoriesSelect)
  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  axiosPost.mockRejectedValue({
    response: { data: { message: err.NAME_MAX, name: 'name' } },
  })

  render(
    <CreateAPostStep2
      csrfToken="csrf"
      images={images}
      latLon={latLon}
      step={2}
      setStep={() => null}
    />
  )

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText('Categories')
  // https://github.com/romgain/react-select-event/issues/97
  selectEvent.openMenu(categoriesSelect)
  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.NAME_MAX)
})
