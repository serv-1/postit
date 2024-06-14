import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '.'
import { FormProvider, useForm } from 'react-hook-form'

function TestForm({ children }: { children: React.ReactNode }) {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        {children}
        <input type="submit" />
      </form>
    </FormProvider>
  )
}

it('takes the focus', () => {
  render(
    <TestForm>
      <Input needFocus name="city" type="text" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveFocus()
})

it("doesn't take the focus", () => {
  render(
    <TestForm>
      <Input name="city" type="text" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).not.toHaveFocus()
})

it('registers into the parent form', () => {
  render(
    <TestForm>
      <Input name="city" type="text" registerOptions={{ disabled: true }} />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAttribute('name', 'city')
  expect(input).toBeDisabled()
})

it('renders red borders if there is an error', async () => {
  render(
    <TestForm>
      <Input name="city" type="text" registerOptions={{ required: true }} />
    </TestForm>
  )

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const container = screen.getByRole('textbox').parentElement!

  expect(container.className).toContain('border-rose')
})

it("doesn't render red borders if there is no error", async () => {
  render(
    <TestForm>
      <Input name="city" type="text" registerOptions={{ required: true }} />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'a')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const container = screen.getByRole('textbox').parentElement!

  expect(container.className).not.toContain('border-rose')
})

it('uses the given class names', () => {
  render(
    <TestForm>
      <Input name="city" type="text" className="city-input" />
    </TestForm>
  )

  const container = screen.getByRole('textbox').parentElement!

  expect(container).toHaveClass('city-input')
})

it('uses the given id', () => {
  render(
    <TestForm>
      <Input name="city" type="text" id="cityInput" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAttribute('id', 'cityInput')
})

it('uses the given name for id if no id has been given', () => {
  render(
    <TestForm>
      <Input name="city" type="text" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAttribute('id', 'city')
})

it('uses the given type', () => {
  render(
    <TestForm>
      <Input name="city" type="text" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAttribute('type', 'text')
})

it('uses the given placeholder', () => {
  render(
    <TestForm>
      <Input name="city" type="text" placeholder="Paris, ..." />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAttribute('placeholder', 'Paris, ...')
})

it('uses the given aria-describedby', () => {
  render(
    <TestForm>
      <Input name="city" type="text" ariaDescribedBy="describer" />
      <span id="describer">Enter a city</span>
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input).toHaveAccessibleDescription('Enter a city')
})

it('can upload multiple files when using a file input', () => {
  render(
    <TestForm>
      <label htmlFor="images">Images</label>
      <Input name="images" type="file" multiple />
    </TestForm>
  )

  const input = screen.getByLabelText('Images')

  expect(input).toHaveAttribute('multiple')
})

it("has specific class names when it's a file input", () => {
  render(
    <TestForm>
      <label htmlFor="images">Images</label>
      <Input name="images" type="file" />
    </TestForm>
  )

  const input = screen.getByLabelText('Images')

  expect(input.className).toContain('file:')
})

it("doesn't have the file input specific class names when it isn't a file input", () => {
  render(
    <TestForm>
      <Input name="city" type="text" />
    </TestForm>
  )

  const input = screen.getByRole('textbox')

  expect(input.className).not.toContain('file:')
})

it('renders the given add-on', () => {
  render(
    <TestForm>
      <Input name="price" type="number" addOn={<span>€</span>} />
    </TestForm>
  )

  const addOn = screen.getByText('€')

  expect(addOn).toBeInTheDocument()
})
