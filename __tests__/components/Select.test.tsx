import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import Select from '../../components/Select'
import selectEvent from 'react-select-event'
import categories from '../../categories'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

const Form = () => {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <label htmlFor="categories">Categories</label>
      <Select name="categories" options={options} />
    </FormProvider>
  )
}

const factory = () => {
  render(<Form />)
}

test('categories are displayed', async () => {
  factory()

  selectEvent.openMenu(screen.getByLabelText(/categories/i))

  const category = screen.getByText(/furniture/i)
  expect(category).toBeInTheDocument()
})
