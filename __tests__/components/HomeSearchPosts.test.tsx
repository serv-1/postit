import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import HomeSearchPosts from '../../components/HomeSearchPosts'

test('the price button opens and closes the price modal on click', async () => {
  render(<HomeSearchPosts />)

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  expect(minPriceInput).toBeInTheDocument()

  await userEvent.click(priceButton)
  expect(minPriceInput).not.toBeInTheDocument()
})

test('the location button opens and closes the location modal on click', async () => {
  render(<HomeSearchPosts />)

  const locationButton = screen.getByRole('button', { name: /location/i })
  await userEvent.click(locationButton)

  const workInProgress = screen.getByText('work in progress')
  expect(workInProgress).toBeInTheDocument()

  await userEvent.click(locationButton)
  expect(workInProgress).not.toBeInTheDocument()
})

test("the modals can't be opened at the same time", async () => {
  render(<HomeSearchPosts />)

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  let minPriceInput: HTMLElement | null = screen.getByRole('spinbutton', {
    name: /minimum/i,
  })
  expect(minPriceInput).toBeInTheDocument()

  const locationButton = screen.getByRole('button', { name: /location/i })
  await userEvent.click(locationButton)
  expect(minPriceInput).not.toBeInTheDocument()

  let workInProgress: HTMLElement | null = screen.getByText('work in progress')
  expect(workInProgress).toBeInTheDocument()
  await userEvent.click(priceButton)

  minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  expect(minPriceInput).toBeInTheDocument()
  expect(workInProgress).not.toBeInTheDocument()
})

test('clicking outside a modal close it', async () => {
  const { container } = render(<HomeSearchPosts />)

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  let minPriceInput: HTMLElement | null = screen.getByRole('spinbutton', {
    name: /minimum/i,
  })
  expect(minPriceInput).toBeInTheDocument()

  await userEvent.click(container)
  expect(minPriceInput).not.toBeInTheDocument()

  const locationButton = screen.getByRole('button', { name: /location/i })
  await userEvent.click(locationButton)

  let workInProgress: HTMLElement | null = screen.getByText('work in progress')
  expect(workInProgress).toBeInTheDocument()

  await userEvent.click(container)
  expect(workInProgress).not.toBeInTheDocument()
})

test("clicking inside a modal don't close it", async () => {
  render(<HomeSearchPosts />)

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  let minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  await userEvent.click(minPriceInput)
  expect(minPriceInput).toBeInTheDocument()
})

it("will fill the form inputs with the query string's data if any", async () => {
  const q = '?query=cat&minPrice=10&maxPrice=100&categories=pet&categories=cat'
  Object.defineProperty(window, 'location', { get: () => ({ search: q }) })

  render(<HomeSearchPosts />)

  const queryInput = screen.getByRole('searchbox')
  expect(queryInput).toHaveValue('cat')

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  expect(minPriceInput).toHaveValue(10)

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })
  expect(maxPriceInput).toHaveValue(100)

  const form = screen.getByRole('search')
  expect(form).toHaveFormValues({ categories: ['pet', 'cat'] })
})

it("updates the query string's data", async () => {
  Object.defineProperty(window, 'location', { get: () => ({ search: '' }) })

  const onQueryStringChange = jest.fn()
  document.addEventListener('queryStringChange', onQueryStringChange)

  const pushState = jest.fn()
  Object.defineProperty(window, 'history', { get: () => ({ pushState }) })

  render(<HomeSearchPosts />)

  const queryInput = screen.getByRole('searchbox')
  await userEvent.type(queryInput, 'Table')

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  await userEvent.type(minPriceInput, '10')

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })
  await userEvent.type(maxPriceInput, '100')

  const categoriesSelect = screen.getByLabelText(/categories/i)
  await selectEvent.select(categoriesSelect, ['furniture', 'pet'])

  const submitBtn = screen.getByRole('button', { name: /search/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const q =
      '?query=Table&minPrice=10&maxPrice=100&categories=furniture&categories=pet'
    const state = { ...window.history.state, as: q, url: q }

    expect(pushState).toHaveBeenNthCalledWith(1, state, '', q)
    expect(onQueryStringChange).toHaveBeenCalledTimes(1)
  })

  document.removeEventListener('queryStringChange', onQueryStringChange)
})
