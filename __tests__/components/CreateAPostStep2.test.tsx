import { render, screen, waitFor } from '@testing-library/react'
import CreateAPostStep2 from '../../components/CreateAPostStep2'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import err from '../../utils/constants/errors'
import RADU from '../../utils/functions/readAsDataUrl'

jest.mock('../../utils/functions/readAsDataUrl')
const mockReadAsDataUrl = RADU as jest.MockedFunction<typeof RADU>

const setError = jest.fn()
const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

beforeEach(() => {
  mockReadAsDataUrl.mockResolvedValue({ ext: 'jpeg', base64: 'azerty' })
  useFormContext.mockReturnValue({
    register: (name: string, { onChange }: RegisterOptions) => ({
      name,
      onChange,
    }),
    formState: { isSubmitted: false, error: {} },
    setError,
  })
})

test('the images can be uploaded by pressing Enter on the label while focusing it', async () => {
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  const input = screen.getByLabelText(/images/i)

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(input).toHaveFocus()
})

test('the image placeholders are rendered if there is no uploaded images', async () => {
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  for (let i = 1; i < 6; i++) {
    const placeholder = screen.getByText(new RegExp('photo n°' + i, 'i'))
    expect(placeholder).toBeInTheDocument()
  }
})

test('the uploaded images are rendered in place of the placeholders', async () => {
  const setImages = jest.fn()
  render(<CreateAPostStep2 setStep={() => null} setImages={setImages} />)

  const input = screen.getByLabelText(/images/i)
  await userEvent.upload(input, [
    new File(['1'], '1.jpeg', { type: 'image/jpeg' }),
    new File(['2'], '2.jpeg', { type: 'image/jpeg' }),
  ])

  const images = await screen.findAllByRole('img')
  expect(images).toHaveLength(2)

  for (let i = 0; i < 2; i++) {
    expect(images[i]).toHaveAttribute('src', 'data:image/jpeg;base64,azerty')
  }

  for (let i = 3; i < 6; i++) {
    const placeholder = screen.getByText(new RegExp('photo n°' + i, 'i'))
    expect(placeholder).toBeInTheDocument()
  }

  expect(setImages).toHaveBeenNthCalledWith(1, [
    { base64: 'azerty', ext: 'jpeg' },
    { base64: 'azerty', ext: 'jpeg' },
  ])
})

test('the "Next" button is disabled when no images have been uploaded and enabled when there are', async () => {
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  const nextBtn = screen.getByRole('button', { name: /next/i })
  expect(nextBtn).toBeDisabled()

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]

  await userEvent.upload(input, files)
  await waitFor(() => expect(nextBtn).toBeEnabled())
})

test('the "Back" and "Next" buttons passes to the previous and the next step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep2 setStep={setStep} setImages={() => null} />)

  const backBtn = screen.getByRole('button', { name: /back/i })
  await userEvent.click(backBtn)
  expect(setStep).toHaveBeenNthCalledWith(1, 0)

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  const nextBtn = screen.getByRole('button', { name: /next/i })
  await userEvent.click(nextBtn)
  expect(setStep).toHaveBeenNthCalledWith(2, 2)
})

test('the uploaded images are deleted if the user cancels the uploading process or attempt to upload too many images', async () => {
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  let img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,azerty')

  await userEvent.upload(input, [])
  expect(img).not.toBeInTheDocument()

  await userEvent.upload(input, files)

  img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,azerty')

  files.push(new File(['2'], '2.jpeg', { type: 'image/jpeg' }))
  files.push(new File(['3'], '3.jpeg', { type: 'image/jpeg' }))
  files.push(new File(['4'], '4.jpeg', { type: 'image/jpeg' }))
  files.push(new File(['5'], '5.jpeg', { type: 'image/jpeg' }))
  files.push(new File(['6'], '6.jpeg', { type: 'image/jpeg' }))
  await userEvent.upload(input, files)

  expect(img).not.toBeInTheDocument()
})

test('an error is created if an image is invalid', async () => {
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  const input = screen.getByLabelText(/images/i)
  await userEvent.upload(input, [new File(['text'], 'text.txt')])

  await waitFor(() =>
    expect(setError).toHaveBeenNthCalledWith(
      1,
      'images',
      { message: err.IMAGE_INVALID },
      { shouldFocus: true }
    )
  )
})

test("an error is created if an image can't be read as data url", async () => {
  mockReadAsDataUrl.mockResolvedValue('error')
  render(<CreateAPostStep2 setStep={() => null} setImages={() => null} />)

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  await waitFor(() =>
    expect(setError).toHaveBeenNthCalledWith(
      1,
      'images',
      { message: 'error' },
      { shouldFocus: true }
    )
  )
})
