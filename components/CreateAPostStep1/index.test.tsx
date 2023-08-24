import { render, screen, waitFor } from '@testing-library/react'
import CreateAPostStep1 from '.'
import userEvent from '@testing-library/user-event'
import err from 'utils/constants/errors'

it('has the "hidden" class if the given step is not its step', () => {
  render(
    <CreateAPostStep1 step={0} setStep={() => null} setImages={() => null} />
  )

  const container = screen.getByTestId('step1')
  expect(container).toHaveClass('hidden')
})

test('the images are uploaded', async () => {
  const setImages = jest.fn()
  render(
    <CreateAPostStep1 step={0} setStep={() => null} setImages={setImages} />
  )

  const input = screen.getByLabelText(/images/i)
  const files = [
    new File(['1'], '1.jpeg', { type: 'image/jpeg' }),
    new File(['2'], '2.jpeg', { type: 'image/jpeg' }),
  ]
  await userEvent.upload(input, files)

  const images = await screen.findAllByRole('img')
  expect(images).toHaveLength(2)

  for (let i = 0; i < 2; i++) {
    expect(images[i].getAttribute('src')).toContain('data:image/jpeg;base64,')
  }

  for (let i = 3; i < 6; i++) {
    const placeholder = screen.getByText(new RegExp('photo n°' + i, 'i'))
    expect(placeholder).toBeInTheDocument()
  }

  const alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()

  await waitFor(() => expect(setImages).toHaveBeenNthCalledWith(1, files))
})

test('the images can be uploaded by pressing Enter on the label while focusing it', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(input).toHaveFocus()
})

test('the placeholders are rendered if there is no uploaded images', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  for (let i = 1; i < 6; i++) {
    const placeholder = screen.getByText(new RegExp('photo n°' + i, 'i'))
    expect(placeholder).toBeInTheDocument()
  }
})

test('the "Next" button is disabled when no images have been uploaded and is enabled when there are', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const nextBtn = screen.getByRole('button', { name: /next/i })
  expect(nextBtn).toBeDisabled()

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]

  await userEvent.upload(input, files)
  await waitFor(() => expect(nextBtn).toBeEnabled())
})

test('the "Back" and "Next" buttons passes to the previous and the next step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep1 step={1} setStep={setStep} setImages={() => null} />)

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

test('uploaded images are unmounted and an error renders if the user cancels the uploading process', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  const img = await screen.findByRole('img')

  await userEvent.upload(input, [])
  expect(img).not.toBeInTheDocument()

  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGES_REQUIRED)
  expect(input.nextElementSibling).toHaveFocus()
})

test('uploaded images are unmounted and an error renders if there is too many images to upload', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  const img = await screen.findByRole('img')

  await userEvent.upload(input, [
    new File(['1'], '1.jpeg', { type: 'image/jpeg' }),
    new File(['2'], '2.jpeg', { type: 'image/jpeg' }),
    new File(['3'], '3.jpeg', { type: 'image/jpeg' }),
    new File(['4'], '4.jpeg', { type: 'image/jpeg' }),
    new File(['5'], '5.jpeg', { type: 'image/jpeg' }),
    new File(['6'], '6.jpeg', { type: 'image/jpeg' }),
  ])
  expect(img).not.toBeInTheDocument()

  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGES_MAX)
  expect(input.nextElementSibling).toHaveFocus()
})

test('an error renders if an image is invalid', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)
  await userEvent.upload(input, [new File(['text'], 'text.txt')])

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGE_INVALID)
  expect(input.nextElementSibling).toHaveFocus()
})

test('an error renders if an image is too big', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)
  const data = new Uint8Array(1_000_001).toString()
  const files = [new File([data], 'image.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(input, files)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGE_TOO_BIG)
  expect(input.nextElementSibling).toHaveFocus()
})

test('an error is deleted after its resolution', async () => {
  render(
    <CreateAPostStep1 step={1} setStep={() => null} setImages={() => null} />
  )

  const input = screen.getByLabelText(/images/i)
  let image = new File(['data'], 'text.txt')
  await userEvent.upload(input, image)

  const alert = screen.getByRole('alert')
  expect(alert).toBeInTheDocument()

  image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  await userEvent.upload(input, image)

  await waitFor(() => expect(alert).not.toBeInTheDocument())
})
