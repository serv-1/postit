import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import HomeSearchPosts from '../../components/HomeSearchPosts'

test('set the url query string parameters with the form data', async () => {
  const onQueryStringChange = jest.fn()
  document.addEventListener('queryStringChange', onQueryStringChange)

  const q = '?query=cat&minPrice=10&maxPrice=100&categories=pet&categories=cat'
  Object.defineProperty(window, 'location', { get: () => ({ search: q }) })

  const pushState = jest.fn()
  Object.defineProperty(window, 'history', { get: () => ({ pushState }) })

  render(<HomeSearchPosts />)

  const queryInput = screen.getByRole('searchbox')
  expect(queryInput).toHaveValue('cat')
  userEvent.clear(queryInput)
  userEvent.type(queryInput, 'Table')

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  expect(minPriceInput).toHaveValue(10)
  userEvent.clear(minPriceInput)

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })
  expect(maxPriceInput).toHaveValue(100)
  userEvent.clear(maxPriceInput)
  userEvent.type(maxPriceInput, '200')

  const form = screen.getByRole('search')
  expect(form).toHaveFormValues({ categories: ['pet', 'cat'] })

  const categoriesSelect = screen.getByRole('combobox')
  await selectEvent.clearAll(categoriesSelect)
  await selectEvent.select(categoriesSelect, ['furniture'])

  const submitBtn = screen.getByRole('button', { name: /search/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    const q = '?query=Table&maxPrice=200&categories=furniture'
    const state = { ...window.history.state, as: q, url: q }

    expect(pushState).toHaveBeenNthCalledWith(1, state, '', q)
    expect(onQueryStringChange).toHaveBeenCalledTimes(1)
  })

  document.removeEventListener('queryStringChange', onQueryStringChange)
})
