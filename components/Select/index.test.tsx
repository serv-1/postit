import { render, screen } from '@testing-library/react'
import Select, { Option } from '.'
import { Categories } from 'types/common'
import ReactSelect, { ControlProps, OptionProps } from 'react-select'
import userEvent from '@testing-library/user-event'

jest.mock('react-select', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockReactSelect = ReactSelect as jest.MockedFunction<
  typeof ReactSelect<Option, true>
>

const useController = jest.spyOn(require('react-hook-form'), 'useController')

interface FormFields {
  categories: Categories[]
}

const states = {
  field: { name: 'categories' },
  formState: { isSubmitted: false, errors: {} },
}

beforeEach(() => useController.mockReturnValue(states))

test("the red border doesn't render if the form isn't submitted", () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border-bottom: 2px solid rgba(112,26,117,0.25)')
})

test('the default border becomes darker if the select is focused', () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: true } as ControlProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border-bottom: 2px solid rgba(112,26,117,0.75)')
})

test('the red border renders if the form is submitted and there is an error', () => {
  useController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: { categories: 'error' } },
  })
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border: 2px solid #E11D48')
})

test('the red border becomes darker if the select is focused', () => {
  useController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: { categories: 'error' } },
  })

  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: true } as ControlProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border: 2px solid #881337')
})

test("the red border doesn't render if the form is submitted and there is no error", () => {
  useController.mockReturnValue({
    ...states,
    formState: { isSubmitted: true, errors: {} },
  })

  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.control) {
      style = styles.control({}, { isFocused: false } as ControlProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border-bottom: 2px solid rgba(112,26,117,0.25)')
})

test('the background color of menu options is light fuchsia if they are focused', () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.option) {
      style = styles.option({}, { isFocused: true } as OptionProps<
        Option,
        true
      >)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('backgroundColor: #f5d0fe')
})

test("the default background color of menu options renders if they aren't focused", () => {
  mockReactSelect.mockImplementation(({ styles }) => {
    let style = {}

    if (styles && styles.option) {
      style = styles.option({ backgroundColor: 'blue' }, {
        isFocused: false,
      } as OptionProps<Option, true>)
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('backgroundColor: blue')
})

test('the current value is correctly displayed', () => {
  useController.mockReturnValue({
    ...states,
    field: { name: 'categories', value: ['animal'] },
  })

  mockReactSelect.mockImplementation(({ value }) => {
    return <option value={(value as Option[])[0].value}></option>
  })

  render(
    <Select<FormFields>
      name="categories"
      options={[{ label: 'animal', value: 'animal' }]}
    />
  )

  const option = screen.getByRole('option')
  expect(option).toHaveValue('animal')
})

test('changing values is correctly handled', async () => {
  const onChange = jest.fn()

  useController.mockReturnValue({
    ...states,
    field: { name: 'categories', value: ['cat'], onChange },
  })

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
