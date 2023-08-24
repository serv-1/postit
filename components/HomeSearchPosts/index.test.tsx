import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormEvent } from 'react'
import selectEvent from 'react-select-event'
import HomeSearchPosts from '.'

it("will fill the form inputs with the query string's data if any", async () => {
  const search =
    '?query=cat&minPrice=10&maxPrice=100&address=Paris&categories=game&categories=toy'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomeSearchPosts />)

  const queryInput = screen.getByRole('searchbox')
  expect(queryInput).toHaveValue('cat')

  const priceButton = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceButton)

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  expect(minPriceInput).toHaveValue(10)

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })
  expect(maxPriceInput).toHaveValue(100)

  const addressButton = screen.getByRole('button', { name: /address/i })
  await userEvent.click(addressButton)

  const addressInput = screen.getByRole('textbox', { name: /city/i })
  expect(addressInput).toHaveValue('Paris')

  const form = screen.getByRole('search')
  expect(form).toHaveFormValues({ categories: ['game', 'toy'] })
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

  const addressButton = screen.getByRole('button', { name: /address/i })
  await userEvent.click(addressButton)

  const addressInput = screen.getByRole('textbox', { name: /city/i })
  await userEvent.type(addressInput, 'Paris')

  const categoriesSelect = screen.getByLabelText(/categories/i)
  await selectEvent.select(categoriesSelect, ['auto', 'moto'])

  const submitBtn = screen.getByRole('button', { name: /search/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const query =
      '?query=Table&categories=auto&categories=moto&minPrice=10&maxPrice=100&address=Paris'
    const state = { ...window.history.state, as: query, url: query }

    expect(pushState).toHaveBeenNthCalledWith(1, state, '', query)
    expect(onQueryStringChange).toHaveBeenCalledTimes(1)
  })

  document.removeEventListener('queryStringChange', onQueryStringChange)
})

it('resets the form states but keep all values after a valid submittion', async () => {
  Object.defineProperty(window, 'location', { get: () => ({ search: '' }) })
  Object.defineProperty(window, 'history', {
    get: () => ({ pushState: () => null }),
  })

  const useForm = jest.spyOn(require('react-hook-form'), 'useForm')
  const useController = jest.spyOn(require('react-hook-form'), 'useController')
  const reset = jest.fn()

  useForm.mockReturnValue({
    handleSubmit:
      (onSubmit: (data: unknown) => void) =>
      (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSubmit(Object.fromEntries(new FormData(e.currentTarget)))
      },
    setValue: () => null,
    formState: { isSubmitted: false, isSubmitSuccessful: true, errors: {} },
    register: (name: string) => ({ name }),
    reset,
  })

  useController.mockReturnValue({
    field: {},
    formState: { isSubmitted: false },
  })

  render(<HomeSearchPosts />)

  await waitFor(() => expect(reset).toHaveBeenCalledTimes(1))
})
