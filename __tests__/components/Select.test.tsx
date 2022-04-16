import { render, screen } from '@testing-library/react'
import Select, { Option } from '../../components/Select'
import { CSSProperties, ForwardRefExoticComponent } from 'react'
import { Categories } from '../../types/common'
import ReactSelect, {
  ActionMeta,
  ControlProps,
  OptionProps,
} from 'react-select'
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'
import userEvent from '@testing-library/user-event'

jest.mock('react-select', () => ({ __esModule: true, default: jest.fn() }))

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
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.control) {
      const states = { isFocused: false } as ControlProps
      style = styles.control({}, states) as CSSProperties
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border-bottom: 2px solid rgba(112,26,117,0.25)')
})

test('the default border becomes darker if the select is focused', () => {
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.control) {
      const states = { isFocused: true } as ControlProps
      style = styles.control({}, states) as CSSProperties
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
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.control) {
      const states = { isFocused: false } as ControlProps
      style = styles.control({}, states) as CSSProperties
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
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.control) {
      const states = { isFocused: true } as ControlProps
      style = styles.control({}, states) as CSSProperties
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
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.control) {
      const states = { isFocused: false } as ControlProps
      style = styles.control({}, states) as CSSProperties
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('border-bottom: 2px solid rgba(112,26,117,0.25)')
})

test('the background color of menu options is light fuchsia if they are focused', () => {
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.option) {
      const states = { isFocused: true } as OptionProps
      style = styles.option({}, states) as CSSProperties
    }

    return <select style={style}></select>
  })

  render(<Select<FormFields> name="categories" options={[]} />)

  const select = screen.getByRole('combobox')
  expect(select).toHaveStyle('backgroundColor: #f5d0fe')
})

test("the default background color of menu options renders if they aren't focused", () => {
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<StateManagerProps>
    >
  ).mockImplementation(({ styles }) => {
    let style: CSSProperties = {}

    if (styles && styles.option) {
      const states = { isFocused: false } as OptionProps
      style = styles.option(
        { backgroundColor: 'blue' },
        states
      ) as CSSProperties
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
    field: { name: 'categories', value: ['cat'] },
  })
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<{ value: Option[] }>
    >
  ).mockImplementation(({ value }) => {
    return <option value={value[0].value}></option>
  })

  render(
    <Select<FormFields>
      name="categories"
      options={[{ label: 'cat', value: 'cat' }]}
    />
  )

  const option = screen.getByRole('option')
  expect(option).toHaveValue('cat')
})

test('changing values is correctly handled', async () => {
  const onChange = jest.fn()

  useController.mockReturnValue({
    ...states,
    field: { name: 'categories', value: ['cat'], onChange },
  })
  ;(
    ReactSelect as jest.MockedFunction<
      ForwardRefExoticComponent<{
        value: Option[]
        onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void
      }>
    >
  ).mockImplementation(({ onChange }) => {
    return (
      <select
        onChange={(e) => {
          const options = e.target.options
          const selectedOptions: { label: string; value: string }[] = []

          for (let i = 0; i < options.length; i++) {
            if (options[i].selected)
              selectedOptions.push({
                label: options[i].value,
                value: options[i].value,
              })
          }

          onChange(selectedOptions, { action: 'select-option', option: {} })
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
