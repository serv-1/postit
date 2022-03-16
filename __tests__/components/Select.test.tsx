import { render, screen } from '@testing-library/react'
import Select from '../../components/Select'
import { forwardRef as mockForwardRef } from 'react'
import { Categories } from '../../types/common'

jest.mock('react-select', () => ({
  __esModule: true,
  default: mockForwardRef<HTMLSelectElement, { className: string }>(
    function MockSelect(props, ref) {
      return <select className={props.className} ref={ref}></select>
    }
  ),
}))

const useController = jest.spyOn(require('react-hook-form'), 'useController')

const states = {
  field: { name: 'categories' },
  formState: { isSubmitted: false, errors: {} },
}

beforeEach(() => useController.mockReturnValue(states))

interface FormFields {
  categories: Categories[]
}

test('the select container has not a red border if the form is not submitted', () => {
  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveClass('border-indigo-600')
})

test('the select container has a red border if the form is submitted and there is an error', () => {
  useController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: { categories: 'error' } },
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveClass('border-red-600')
})

test('the select container has not a red border if the form is submitted and there is no error', () => {
  useController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: {} },
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveClass('border-indigo-600')
})
