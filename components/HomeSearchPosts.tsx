import MainButton from './MainButton'
import Form from './Form'
import Input from './Input'
import Select from './Select'
import categories from '../categories'
import InputError from './InputError'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import {
  searchPostsSchema,
  SearchPostsSchema,
} from '../lib/joi/searchPostsSchema'
import { useEffect, useState } from 'react'
import { Categories } from '../types/common'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

type OpenedModalState = 'price' | 'location' | 'none'

const HomeSearchPosts = () => {
  const [openedModal, setOpenedModal] = useState<OpenedModalState>('none')

  const methods = useForm<SearchPostsSchema>({
    resolver: joiResolver(searchPostsSchema),
  })

  const submitHandler: SubmitHandler<SearchPostsSchema> = (data) => {
    const { query, minPrice, maxPrice, categories } = data

    const url = new URLSearchParams({ query })

    if (minPrice) url.append('minPrice', minPrice)
    if (maxPrice) url.append('maxPrice', maxPrice)
    if (categories) categories.forEach((c) => url.append('categories', c))

    const newUrl = '?' + url.toString()
    const state = { ...window.history.state, as: newUrl, url: newUrl }

    // To avoid rerender with router.push(), we use pushState.
    // We must specify the state because if we do not NextJS fails to send
    // us back to the previous page.
    // see: https://github.com/vercel/next.js/discussions/18072
    window.history.pushState(state, '', newUrl)

    document.dispatchEvent(new CustomEvent('queryStringChange'))
  }

  useEffect(() => {
    if (!window.location.search) return

    const queryString = new URLSearchParams(window.location.search)
    const categories = queryString.getAll('categories') as Categories[]
    const query = queryString.get('query')

    if (query) methods.setValue('query', query)
    methods.setValue('categories', categories)
    methods.setValue('minPrice', queryString.get('minPrice') || undefined)
    methods.setValue('maxPrice', queryString.get('maxPrice') || undefined)
  }, [methods])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const modal = (e.target as Element).closest('#priceModal, #locationModal')
      if (modal) return

      setOpenedModal('none')
    }

    document.addEventListener('click', onClick)

    return () => document.removeEventListener('click', onClick)
  }, [setOpenedModal])

  return (
    <Form
      name="searchPost"
      method="get"
      methods={methods}
      submitHandler={submitHandler}
      role="search"
      className="relative"
    >
      <div className="mb-8 md:inline-block md:w-[calc(50%-4px)] md:mr-8 lg:block lg:w-auto lg:mr-0">
        <Input<SearchPostsSchema>
          name="query"
          type="search"
          placeholder="Umbrella, sofa, ..."
        />
        <InputError<SearchPostsSchema> inputName="query" />
      </div>
      <div className="mb-8 md:inline-block md:w-[calc(50%-4px)] lg:block lg:w-auto">
        <Select<SearchPostsSchema>
          name="categories"
          options={options}
          aria-label="Categories"
          placeholder="Categories"
        />
        <InputError<SearchPostsSchema> inputName="categories" />
      </div>
      <button
        type="button"
        className="text-fuchsia-600 border-2 border-fuchsia-600 rounded-full px-8 py-4 font-bold hover:bg-fuchsia-600 hover:text-fuchsia-50 active:bg-fuchsia-900 active:text-fuchsia-50 active:border-fuchsia-900 transition-colors mr-8"
        onClick={(e) => {
          setOpenedModal(openedModal === 'price' ? 'none' : 'price')
          e.stopPropagation()
        }}
      >
        Price
      </button>
      {openedModal === 'price' && (
        <div
          id="priceModal"
          className="bg-fuchsia-200 border-2 border-fuchsia-500 shadow-[0_0_16px_#D946EF] rounded-8 absolute inset-x-0 top-[calc(100%+4px)] z-20 p-16 max-w-[328px]"
        >
          <span className="font-bold mb-8">Price</span>
          <div className="flex flex-row flex-nowrap">
            <div className="mr-8">
              <label htmlFor="minPrice">Minimum</label>
              <Input<SearchPostsSchema>
                id="minPrice"
                name="minPrice"
                type="number"
                addOn="€"
                addOnClass="text-[rgba(112,26,117,0.5)]"
                needFocus
              />
            </div>
            <div>
              <label htmlFor="maxPrice">Maximum</label>
              <Input<SearchPostsSchema>
                id="maxPrice"
                name="maxPrice"
                type="number"
                addOn="€"
                addOnClass="text-[rgba(112,26,117,0.5)]"
              />
            </div>
          </div>
          <InputError<SearchPostsSchema> inputName="minPrice" />
          <InputError<SearchPostsSchema> inputName="maxPrice" />
        </div>
      )}
      <button
        type="button"
        className="text-fuchsia-600 border-2 border-fuchsia-600 rounded-full px-8 py-4 font-bold hover:bg-fuchsia-600 hover:text-fuchsia-50 active:bg-fuchsia-900 active:text-fuchsia-50 active:border-fuchsia-900 transition-colors"
        onClick={(e) => {
          setOpenedModal(openedModal === 'location' ? 'none' : 'location')
          e.stopPropagation()
        }}
      >
        Location
      </button>
      {openedModal === 'location' && (
        <div
          id="locationModal"
          className="bg-fuchsia-200 border-2 border-fuchsia-500 shadow-[0_0_16px_#D946EF] rounded-8 absolute inset-x-0 top-[calc(100%+4px)] z-20 p-16 max-w-[328px]"
        >
          <span className="font-bold mb-8">Location</span>
          <p>work in progress</p>
        </div>
      )}
      <MainButton
        type="submit"
        aria-label="Search"
        className="absolute right-0 -bottom-[36px] md:left-1/2 md:-translate-x-1/2 md:right-auto lg:right-0 lg:left-auto lg:translate-x-0 z-10"
      >
        Search
      </MainButton>
    </Form>
  )
}

export default HomeSearchPosts
