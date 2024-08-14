import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import SearchPostForm from '.'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'

const pathname = 'http://localhost'
const mockRouterPush = jest.fn()
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => pathname,
  useSearchParams: jest.fn(),
  ReadonlyURLSearchParams: class extends URLSearchParams {
    constructor(searchParams: URLSearchParams) {
      super(searchParams)
    }
  },
}))

function setSearchParams(searchParams?: string) {
  mockUseSearchParams.mockReturnValue(
    new ReadonlyURLSearchParams(new URLSearchParams(searchParams))
  )
}

beforeEach(() => {
  setSearchParams()
})

it('uses the search params to fill in the form', async () => {
  setSearchParams(
    'query=cat&minPrice=10&maxPrice=100&address=Paris&categories=animal'
  )

  render(<SearchPostForm />)

  const queryInput = screen.getByRole('searchbox')

  expect(queryInput).toHaveValue('cat')

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })

  expect(minPriceInput).toHaveValue(10)

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })

  expect(maxPriceInput).toHaveValue(100)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const addressInput = screen.getByRole('textbox', { name: /city/i })

  expect(addressInput).toHaveValue('Paris')

  const animal = screen.getByText('animal')

  expect(animal).toBeInTheDocument()
})

it("doesn't fill in the minPrice input if its search param isn't defined", async () => {
  setSearchParams('query=cat&categories=animal')

  render(<SearchPostForm />)

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })

  expect(minPriceInput).toHaveValue(null)
})

it("doesn't fill in the maxPrice input if its search param isn't defined", async () => {
  setSearchParams('query=cat&categories=animal')

  render(<SearchPostForm />)

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })

  expect(maxPriceInput).toHaveValue(null)
})

it("doesn't fill in the address input if its search param isn't defined", async () => {
  setSearchParams('query=cat&categories=animal')

  render(<SearchPostForm />)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const addressInput = screen.getByRole('textbox', { name: /city/i })

  expect(addressInput).toHaveValue('')
})

it('adds the form values to the search params on submit', async () => {
  render(<SearchPostForm />)

  const queryInput = screen.getByRole('searchbox')

  await userEvent.type(queryInput, 'table')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })

  await userEvent.type(minPriceInput, '10')

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })

  await userEvent.type(maxPriceInput, '100')

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const addressInput = screen.getByRole('textbox', { name: /city/i })

  await userEvent.type(addressInput, 'Paris')

  const submitBtn = screen.getByRole('button', { name: /search/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush).toHaveBeenNthCalledWith(
    1,
    pathname +
      '?query=table&categories=furniture&minPrice=10&maxPrice=100&address=Paris'
  )
})

it("doesn't add the undefined minPrice to the search params", async () => {
  render(<SearchPostForm />)

  const queryInput = screen.getByRole('searchbox')

  await userEvent.type(queryInput, 'table')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const submitBtn = screen.getByRole('button', { name: /search/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush.mock.calls[0][0]).not.toContain('minPrice')
})

it("doesn't add the undefined maxPrice to the search params", async () => {
  render(<SearchPostForm />)

  const queryInput = screen.getByRole('searchbox')

  await userEvent.type(queryInput, 'table')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const submitBtn = screen.getByRole('button', { name: /search/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush.mock.calls[0][0]).not.toContain('maxPrice')
})

it("doesn't add the undefined address to the search params", async () => {
  render(<SearchPostForm />)

  const queryInput = screen.getByRole('searchbox')

  await userEvent.type(queryInput, 'table')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const submitBtn = screen.getByRole('button', { name: /search/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush.mock.calls[0][0]).not.toContain('address')
})
