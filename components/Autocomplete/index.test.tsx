import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Autocomplete from '.'

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn()
})

it('renders the input correctly', () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const input = screen.getByRole('combobox')

  expect(input).toHaveAttribute('aria-expanded', 'false')
  expect(input).toHaveAttribute('aria-activedescendant', '')
})

it('renders the error correctly', () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
      error="error"
    />
  )

  const error = screen.getByRole('alert')

  expect(error).toHaveTextContent('error')
})

it("doesn't render the error if there is none", () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const error = screen.queryByRole('alert')

  expect(error).not.toBeInTheDocument()
})

it('renders the option list if the input is focused', async () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  const optionList = screen.getByRole('listbox')

  expect(optionList).toBeInTheDocument()
})

it('unmounts the option list if the input loses focus', async () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.click(document.body)

  const optionList = screen.queryByRole('listbox')

  expect(optionList).not.toBeInTheDocument()
})

it('unmounts the option list if a click is made outside the autocomplete container', async () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.click(input.parentElement!.parentElement!)

  const optionList = screen.queryByRole('listbox')

  expect(optionList).not.toBeInTheDocument()
})

it("doesn't unmount the option list if a click is made inside the autocomplete container", async () => {
  render(
    <Autocomplete
      options={[]}
      renderInput={(p) => <input {...p} />}
      renderOption={() => null}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.click(input.parentElement!)

  const optionList = screen.getByRole('listbox')

  expect(optionList).toBeInTheDocument()
})

it('stops the propagation of the wheel event inside the autocomplete container', async () => {
  const onWheel = jest.fn()

  render(
    <div onWheel={onWheel}>
      <Autocomplete
        options={[]}
        renderInput={(p) => <input {...p} />}
        renderOption={() => null}
      />
    </div>
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  const optionList = screen.getByRole('listbox')

  optionList.dispatchEvent(new Event('wheel'))

  expect(onWheel).not.toHaveBeenCalled()
})

it('stops the propagation of the touchmove event inside the autocomplete container', async () => {
  const onTouchMove = jest.fn()

  render(
    <div onTouchMove={onTouchMove}>
      <Autocomplete
        options={[]}
        renderInput={(p) => <input {...p} />}
        renderOption={() => null}
      />
    </div>
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  const optionList = screen.getByRole('listbox')

  optionList.dispatchEvent(new Event('touchmove'))

  expect(onTouchMove).not.toHaveBeenCalled()
})

it('renders the options correctly', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', color: 'red' },
        { id: '1', color: 'green' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li key={o.id} {...p}>
          {o.color}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  const options = screen.getAllByRole('option')

  expect(options).toHaveLength(2)
  expect(options[0]).toHaveTextContent('red')
  expect(options[0]).toHaveAttribute('aria-selected', 'true')
  expect(options[0]).toHaveClass('bg-fuchsia-200')
  expect(options[1]).toHaveTextContent('green')
  expect(options[1]).toHaveAttribute('aria-selected', 'false')
  expect(options[1]).toHaveClass('bg-fuchsia-100')
})

it('selects the next option if the down arrow key is pressed', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', color: 'red' },
        { id: '1', color: 'green' },
        { id: '2', color: 'blue' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li key={o.id} {...p}>
          {o.color}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowDown}')

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('aria-selected', 'false')
  expect(options[0]).toHaveClass('bg-fuchsia-100')
  expect(options[1]).toHaveAttribute('aria-selected', 'true')
  expect(options[1]).toHaveClass('bg-fuchsia-200')
  expect(options[2]).toHaveAttribute('aria-selected', 'false')
  expect(options[2]).toHaveClass('bg-fuchsia-100')
})

it('selects the first option if the down arrow key is pressed and the last option is active', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', color: 'red' },
        { id: '1', color: 'green' },
        { id: '2', color: 'blue' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li key={o.id} {...p}>
          {o.color}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('aria-selected', 'true')
  expect(options[0]).toHaveClass('bg-fuchsia-200')
  expect(options[1]).toHaveAttribute('aria-selected', 'false')
  expect(options[1]).toHaveClass('bg-fuchsia-100')
  expect(options[2]).toHaveAttribute('aria-selected', 'false')
  expect(options[2]).toHaveClass('bg-fuchsia-100')
})

it('selects the previous option if the up arrow key is pressed', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', color: 'red' },
        { id: '1', color: 'green' },
        { id: '2', color: 'blue' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li key={o.id} {...p}>
          {o.color}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('aria-selected', 'false')
  expect(options[0]).toHaveClass('bg-fuchsia-100')
  expect(options[1]).toHaveAttribute('aria-selected', 'true')
  expect(options[1]).toHaveClass('bg-fuchsia-200')
  expect(options[2]).toHaveAttribute('aria-selected', 'false')
  expect(options[2]).toHaveClass('bg-fuchsia-100')
})

it('selects the last option if the up arrow key is pressed and the first option is active', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', color: 'red' },
        { id: '1', color: 'green' },
        { id: '2', color: 'blue' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li key={o.id} {...p}>
          {o.color}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowUp}')

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('aria-selected', 'false')
  expect(options[0]).toHaveClass('bg-fuchsia-100')
  expect(options[1]).toHaveAttribute('aria-selected', 'false')
  expect(options[1]).toHaveClass('bg-fuchsia-100')
  expect(options[2]).toHaveAttribute('aria-selected', 'true')
  expect(options[2]).toHaveClass('bg-fuchsia-200')
})

it('unmounts the option list if the tab key is pressed', async () => {
  render(
    <Autocomplete
      options={[{ id: '0', label: 'a' }]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li {...p} key={o.id}>
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.tab()

  const optionList = screen.queryByRole('listbox')

  expect(optionList).not.toBeInTheDocument()
})

it('unmounts the option list if the enter key is pressed', async () => {
  render(
    <Autocomplete
      options={[{ id: '0', label: 'a' }]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li {...p} key={o.id}>
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{Enter}')

  const optionList = screen.queryByRole('listbox')

  expect(optionList).not.toBeInTheDocument()
})

it("executes the active option's onClick handler if the tab key is pressed", async () => {
  const mockOnClick = jest.fn()

  render(
    <Autocomplete
      options={[{ id: '0', label: 'a' }]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li
          {...p}
          key={o.id}
          onClick={(e) => {
            p.onClick(e)
            mockOnClick()
          }}
        >
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.tab()

  expect(mockOnClick).toHaveBeenCalledTimes(1)
})

it("executes the active option's onClick handler if the enter key is pressed", async () => {
  const mockOnClick = jest.fn()

  render(
    <Autocomplete
      options={[{ id: '0', label: 'a' }]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li
          {...p}
          key={o.id}
          onClick={(e) => {
            p.onClick(e)
            mockOnClick()
          }}
        >
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)
  await userEvent.keyboard('{Enter}')

  expect(mockOnClick).toHaveBeenCalledTimes(1)
})

it('unmounts the option list if an option is clicked', async () => {
  render(
    <Autocomplete
      options={[{ id: '0', label: 'a' }]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li {...p} key={o.id}>
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  const option = screen.getByRole('option')

  await userEvent.click(option)

  const optionList = screen.queryByRole('listbox')

  expect(optionList).not.toBeInTheDocument()
})

it('selects the clicked option', async () => {
  render(
    <Autocomplete
      options={[
        { id: '0', label: 'a' },
        { id: '1', label: 'b' },
      ]}
      renderInput={(p) => <input {...p} />}
      renderOption={(p, o) => (
        <li {...p} key={o.id}>
          {o.label}
        </li>
      )}
    />
  )

  const input = screen.getByRole('combobox')

  await userEvent.click(input)

  let options = screen.getAllByRole('option')

  await userEvent.click(options[1])
  await userEvent.click(input)

  options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('aria-selected', 'false')
  expect(options[0]).toHaveClass('bg-fuchsia-100')
  expect(options[1]).toHaveAttribute('aria-selected', 'true')
  expect(options[1]).toHaveClass('bg-fuchsia-200')
})
