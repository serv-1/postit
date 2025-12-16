'use client'

import Form from 'components/Form'
import Input from 'components/Input'
import Select from 'components/Select'
import { CATEGORIES } from 'constants/index'
import InputError from 'components/InputError'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import type { Categories } from 'types'
import searchPost, { type SearchPost } from 'schemas/client/searchPost'
import PopoverField from 'components/PopoverField'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function SearchPostForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  let values: SearchPost | undefined = undefined

  if (searchParams.has('query')) {
    values = {
      query: searchParams.get('query')!,
      categories: searchParams.getAll('categories') as Categories[],
    }

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const address = searchParams.get('address')

    if (minPrice) values.minPrice = minPrice
    if (maxPrice) values.maxPrice = maxPrice
    if (address) values.address = address
  }

  const methods = useForm<SearchPost>({
    resolver: joiResolver(searchPost),
    values,
  })

  const submitHandler: SubmitHandler<SearchPost> = ({
    query,
    minPrice,
    maxPrice,
    categories,
    address,
  }) => {
    const searchParams = new URLSearchParams({ query })

    for (const category of categories) {
      searchParams.append('categories', category)
    }

    if (minPrice) searchParams.append('minPrice', minPrice)
    if (maxPrice) searchParams.append('maxPrice', maxPrice)
    if (address) searchParams.append('address', address)

    router.push(pathname + '?' + searchParams.toString())
  }

  return (
    <Form
      name="searchPost"
      method="get"
      methods={methods}
      submitHandler={submitHandler}
      role="search"
      className="relative flex flex-wrap gap-8"
    >
      <div className="w-full">
        <Select<SearchPost>
          name="categories"
          options={options}
          aria-label="Categories"
          placeholder="Categories"
        />
        <InputError<SearchPost> name="categories" />
      </div>
      <div className="w-full">
        <Input<SearchPost>
          name="query"
          type="search"
          className="bg-fuchsia-50"
          placeholder="Umbrella, sofa, ..."
        />
        <InputError<SearchPost> name="query" />
      </div>
      <PopoverField label="Price">
        <div className="flex flex-row flex-nowrap">
          <div className="mr-8 w-[calc(50%-4px)]">
            <label htmlFor="minPrice">Minimum</label>
            <Input<SearchPost>
              id="minPrice"
              name="minPrice"
              type="number"
              addOn={<span className="text-fuchsia-900/50">€</span>}
              className="bg-fuchsia-50"
              needFocus
            />
          </div>
          <div className="w-[calc(50%-4px)]">
            <label htmlFor="maxPrice">Maximum</label>
            <Input<SearchPost>
              id="maxPrice"
              name="maxPrice"
              type="number"
              addOn={<span className="text-fuchsia-900/50">€</span>}
              className="bg-fuchsia-50"
            />
          </div>
        </div>
        <InputError<SearchPost> name="minPrice" />
        <InputError<SearchPost> name="maxPrice" />
      </PopoverField>
      <PopoverField label="Address">
        <label htmlFor="address">
          A city, county, state, country or a postal code is expected.
        </label>
        <Input<SearchPost>
          id="address"
          name="address"
          type="text"
          needFocus
          className="bg-fuchsia-50"
        />
        <InputError<SearchPost> name="address" />
      </PopoverField>
      <div className="absolute right-0 -bottom-[36px] md:left-1/2 md:-translate-x-1/2 md:right-auto lg:right-0 lg:left-auto lg:translate-x-0 z-10">
        <button className="primary-btn">Search</button>
      </div>
    </Form>
  )
}
