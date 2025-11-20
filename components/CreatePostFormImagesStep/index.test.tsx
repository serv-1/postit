import { FormProvider, useForm } from 'react-hook-form'
import CreatePostFormImagesStep from '.'
import WizardProvider from 'components/WizardProvider'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WizardStep from 'components/WizardStep'
import { joiResolver } from '@hookform/resolvers/joi'
import imageList from 'schemas/imageList'
import Joi from 'joi'

function TestForm() {
  const methods = useForm({
    resolver: joiResolver(Joi.object({ images: imageList })),
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <WizardProvider>
          <CreatePostFormImagesStep />
          <WizardStep className="flex">step 2</WizardStep>
        </WizardProvider>
      </form>
    </FormProvider>
  )
}

it('disables the next button if no images has been uploaded', async () => {
  render(<TestForm />)

  const nextBtn = screen.getByRole('button', { name: /next/i })

  expect(nextBtn).toBeDisabled()
})

it('enables the next button if an image has been uploaded', async () => {
  render(<TestForm />)

  const input = screen.getByLabelText(/images/i)

  await userEvent.upload(
    input,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nextBtn = screen.getByRole('button', { name: /next/i })

  await waitFor(() => {
    expect(nextBtn).toBeEnabled()
  })
})

it('renders the placeholders if no images have been uploaded', () => {
  render(<TestForm />)

  for (let i = 1; i < 6; i++) {
    const placeholder = screen.getByText(new RegExp('photo n°' + i, 'i'))
    expect(placeholder).toBeInTheDocument()
  }
})

it('triggers a click on the input if pressing Enter on the label', async () => {
  render(<TestForm />)

  const input = document.getElementsByTagName('input')[0]

  input.click = jest.fn()

  const label = screen.getByText(/Images/i)
    .nextElementSibling as HTMLLabelElement

  label.focus()

  await userEvent.keyboard('{Enter}')

  expect(input.click).toHaveBeenCalledTimes(1)
})

it('renders a preview of the uploaded images', async () => {
  render(<TestForm />)

  const input = screen.getByLabelText(/images/i)

  await userEvent.upload(input, [
    new File(['1'], '1.jpeg', { type: 'image/jpeg' }),
    new File(['2'], '2.jpeg', { type: 'image/jpeg' }),
  ])

  const previews = await screen.findAllByRole('presentation')

  expect(previews[0].getAttribute('src')).toContain('data:image/jpeg;base64,')
  expect(previews[1].getAttribute('src')).toContain('data:image/jpeg;base64,')

  const placeholders = screen.getAllByText(/photo n°/i)

  expect(placeholders).toHaveLength(3)
})

it('removes all image previews if an invalid image is uploaded', async () => {
  render(<TestForm />)

  const input = screen.getByLabelText(/images/i)

  await userEvent.upload(input, [
    new File(['1'], '1.jpeg', { type: 'image/jpeg' }),
    new File(['2'], '2.jpeg', { type: 'image/jpeg' }),
  ])

  const previews = await screen.findAllByRole('presentation')

  await userEvent.upload(input, new File([''], '_.txt', { type: 'text/plain' }))

  expect(previews[0]).not.toBeInTheDocument()
  expect(previews[1]).not.toBeInTheDocument()

  const placeholders = screen.getAllByText(/photo n°/i)

  expect(placeholders).toHaveLength(5)
})
