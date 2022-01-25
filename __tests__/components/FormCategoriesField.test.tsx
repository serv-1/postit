import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import selectEvent from 'react-select-event'
import FormCategoriesField from '../../components/FormCategoriesField'

const Form = () => {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <FormCategoriesField />
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
