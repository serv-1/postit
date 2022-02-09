import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import Select from '../../components/Select'
import selectEvent from 'react-select-event'
import categories from '../../categories'
import { ReactNode } from 'react'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

jest.mock('react-hook-form', () => {
  return {
    Controller: ({
      name,
      render,
    }: {
      name: string
      render: ({
        field,
        formState: { isSubmitted, errors },
      }: {
        field: { name: string }
        formState: { isSubmitted: boolean; errors: { [x: string]: unknown } }
      }) => ReactNode
    }) => {
      return render({
        field: { name },
        formState: { isSubmitted: false, errors: {} },
      })
    },
  }
})

test('categories are displayed', async () => {
  render(
    <>
      <label htmlFor="categories">Categories</label>
      <Select name="categories" options={options} />
    </>
  )

  selectEvent.openMenu(screen.getByLabelText(/categories/i))

  const category = screen.getByText(/furniture/i)
  expect(category).toBeInTheDocument()
})
