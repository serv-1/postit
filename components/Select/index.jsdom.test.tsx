import { render, screen } from '@testing-library/react'
import Select, { type Option } from '.'
import type { Categories } from 'types'
import ReactSelect, { type ControlProps, type OptionProps } from 'react-select'
import userEvent from '@testing-library/user-event'
import { useController, type UseControllerReturn } from 'react-hook-form'

vi.mock('react-select', () => ({
  default: vi.fn(),
}))

vi.mock('react-hook-form', () => ({
  useController: vi.fn(),
}))

const mockReactSelect = vi.mocked(ReactSelect)
const mockUseController = vi.mocked(useController)

interface FormFields {
  categories: Categories[]
}

const states = {
  field: { name: 'categories' },
  formState: { isSubmitted: false, errors: {} },
} as UseControllerReturn

beforeEach(() => mockUseController.mockReturnValue(states))

test("the red border doesn't render if the form isn't submitted", () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({
    borderBottom: '2px solid rgba(112,26,117,0.25)',
  })
})

test('the default border becomes darker if the select is focused', () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: true } as ControlProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({
    borderBottom: '2px solid rgba(112,26,117,0.75)',
  })
})

test('the red border renders if the form is submitted and there is an error', () => {
  mockUseController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: { categories: 'error' } },
  } as unknown as UseControllerReturn)

  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({ border: '2px solid #E11D48' })
})

test('the red border becomes darker if the select is focused', () => {
  mockUseController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: { categories: 'error' } },
  } as unknown as UseControllerReturn)

  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: true } as ControlProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({ border: '2px solid #881337' })
})

test("the red border doesn't render if the form is submitted and there is no error", () => {
  mockUseController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: {} },
  } as unknown as UseControllerReturn)

  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({
    borderBottom: '2px solid rgba(112,26,117,0.25)',
  })
})

test('the background color of menu options is light fuchsia if they are focused', () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.option) {
      style = styles.option({}, { isFocused: true } as OptionProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle({ backgroundColor: '#f5d0fe' })
})

test("the default background color of menu options renders if they aren't focused", () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.option) {
      style = styles.option({}, { isFocused: false } as OptionProps)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).not.toHaveStyle({ backgroundColor: '#f5d0fe' })
})

test('the current value is correctly displayed', () => {
  mockUseController.mockReturnValue({
    ...states,
    field: { name: 'categories', value: ['animal'] },
  } as unknown as UseControllerReturn)

  mockReactSelect.mockImplementation(({ value }) => {
    return <option value={(value as Option[])[0].value}></option>
  })

  render(
    <Select<FormFields>
      name="categories"
      options={[{ label: 'animal', value: 'animal' }]}
    />,
  )

  const option = screen.getByRole('option')
  expect(option).toHaveValue('animal')
})

test('changing values is correctly handled', async () => {
  const onChange = vi.fn()

  mockUseController.mockReturnValue({
    ...states,
    field: { name: 'categories', value: ['cat'], onChange },
  } as unknown as UseControllerReturn)

  mockReactSelect.mockImplementation(({ onChange }) => {
    return (
      <select
        onChange={(e) => {
          const options = e.target.options
          const selectedOptions: Option[] = []

          for (let i = 0; i < options.length; i++) {
            if (options[i].selected)
              selectedOptions.push({
                label: options[i].value as Categories,
                value: options[i].value as Categories,
              })
          }

          ;(onChange as NonNullable<typeof onChange>)(selectedOptions, {
            action: 'select-option',
            option: {} as Option,
          })
        }}
      >
        <option value="cat">Cat</option>
        <option value="pet">Pet</option>
      </select>
    )
  })

  render(<Select name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  await userEvent.selectOptions(select, 'pet')

  expect(onChange).toHaveBeenNthCalledWith(1, ['pet'])
})
