import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import SearchPostForm from '.'

describe('use the url search params as initial values for', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', { value: { search: '' } })
  })

  test('the query input', () => {
    window.location.search = '?query=cat'

    render(<SearchPostForm />)

    const queryInput = screen.getByRole('searchbox')

    expect(queryInput).toHaveValue('cat')
  })

  test('the min price input', async () => {
    window.location.search = '?minPrice=10'

    render(<SearchPostForm />)

    const priceBtn = screen.getByRole('button', { name: /price/i })

    await userEvent.click(priceBtn)

    const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })

    expect(minPriceInput).toHaveValue(10)
  })

  test('the max price input', async () => {
    window.location.search = '?maxPrice=100'

    render(<SearchPostForm />)

    const priceBtn = screen.getByRole('button', { name: /price/i })

    await userEvent.click(priceBtn)

    const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })

    expect(maxPriceInput).toHaveValue(100)
  })

  test('the address input', async () => {
    window.location.search = '?address=Paris'

    render(<SearchPostForm />)

    const addressBtn = screen.getByRole('button', { name: /address/i })

    await userEvent.click(addressBtn)

    const addressInput = screen.getByRole('textbox', { name: /city/i })

    expect(addressInput).toHaveValue('Paris')
  })

  test('the categories select', () => {
    window.location.search = '?categories=auto&categories=moto'

    render(<SearchPostForm />)

    const auto = screen.getByText('auto')

    expect(auto).toBeInTheDocument()

    const moto = screen.getByText('moto')

    expect(moto).toBeInTheDocument()
  })

  test('all', async () => {
    window.location.search =
      '?query=cat&minPrice=10&maxPrice=100&address=Paris&categories=animal'

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
})

describe('add to the url search params', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { search: '' },
    })

    Object.defineProperty(window, 'history', {
      value: {
        pushState: (data: unknown, unused: string, url: string) => {
          window.location.search = url
        },
      },
    })
  })

  beforeEach(() => {
    window.location.search = ''
  })

  test('the required values only', async () => {
    render(<SearchPostForm />)

    const queryInput = screen.getByRole('searchbox')

    await userEvent.type(queryInput, 'table')

    const categoriesSelect = screen.getByLabelText(/categories/i)

    await selectEvent.select(categoriesSelect, ['furniture', 'decoration'])

    const submitBtn = screen.getByRole('button', { name: /search/i })

    await userEvent.click(submitBtn)

    expect(window.location.search).toBe(
      '?query=table&categories=furniture&categories=decoration'
    )
  })

  test('the required values and the min price', async () => {
    render(<SearchPostForm />)

    const queryInput = screen.getByRole('searchbox')

    await userEvent.type(queryInput, 'table')

    const categoriesSelect = screen.getByLabelText(/categories/i)

    await selectEvent.select(categoriesSelect, 'furniture')

    const priceBtn = screen.getByRole('button', { name: /price/i })

    await userEvent.click(priceBtn)

    const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })

    await userEvent.type(minPriceInput, '10')

    const submitBtn = screen.getByRole('button', { name: /search/i })

    await userEvent.click(submitBtn)

    expect(window.location.search).toBe(
      '?query=table&categories=furniture&minPrice=10'
    )
  })

  test('the required values and the max price', async () => {
    render(<SearchPostForm />)

    const queryInput = screen.getByRole('searchbox')

    await userEvent.type(queryInput, 'table')

    const categoriesSelect = screen.getByLabelText(/categories/i)

    await selectEvent.select(categoriesSelect, 'furniture')

    const priceBtn = screen.getByRole('button', { name: /price/i })

    await userEvent.click(priceBtn)

    const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })

    await userEvent.type(maxPriceInput, '100')

    const submitBtn = screen.getByRole('button', { name: /search/i })

    await userEvent.click(submitBtn)

    expect(window.location.search).toBe(
      '?query=table&categories=furniture&maxPrice=100'
    )
  })

  test('the required values and the address', async () => {
    render(<SearchPostForm />)

    const queryInput = screen.getByRole('searchbox')

    await userEvent.type(queryInput, 'table')

    const categoriesSelect = screen.getByLabelText(/categories/i)

    await selectEvent.select(categoriesSelect, 'furniture')

    const addressBtn = screen.getByRole('button', { name: /address/i })

    await userEvent.click(addressBtn)

    const addressInput = screen.getByRole('textbox', { name: /city/i })

    await userEvent.type(addressInput, 'Paris')

    const submitBtn = screen.getByRole('button', { name: /search/i })

    await userEvent.click(submitBtn)

    expect(window.location.search).toBe(
      '?query=table&categories=furniture&address=Paris'
    )
  })

  test('all', async () => {
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

    expect(window.location.search).toBe(
      '?query=table&categories=furniture&minPrice=10&maxPrice=100&address=Paris'
    )
  })
})

it('triggers a "searchPost" event on submit', async () => {
  render(<SearchPostForm />)

  const mockListener = jest.fn()

  document.addEventListener('searchPost', mockListener)

  const queryInput = screen.getByRole('searchbox')

  await userEvent.type(queryInput, 'table')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const submitBtn = screen.getByRole('button', { name: /search/i })

  await userEvent.click(submitBtn)

  expect(mockListener).toHaveBeenCalledTimes(1)
})
