import { joiResolver } from '@hookform/resolvers/joi'
import { SubmitHandler, useForm } from 'react-hook-form'
import Button from './Button'
import Form from './Form'
import Input from './Input'
import Label from './Label'
import Select from './Select'
import searchPostSchema from '../lib/joi/searchPostSchema'
import Search from '../public/static/images/search.svg'
import categories from '../categories'
import { Dispatch, SetStateAction } from 'react'
import { IPost } from '../models/Post'
import axios from 'axios'
import InputError from './InputError'
import getApiError from '../utils/functions/getApiError'
import { useToast } from '../contexts/toast'
import Particles from 'react-tsparticles'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface FormFields {
  query: string
  minPrice?: number
  maxPrice?: number
  categories?: typeof categories[]
}

interface HomeSearchPostsProps {
  setPosts: Dispatch<SetStateAction<IPost[] | undefined>>
}

const HomeSearchPosts = ({ setPosts }: HomeSearchPostsProps) => {
  const { setToast } = useToast()
  const methods = useForm<FormFields>({
    resolver: joiResolver(searchPostSchema),
  })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      const res = await axios.get<{ posts: IPost[] }>(
        'http://localhost:3000/api/posts/search',
        {
          params: data,
        }
      )
      setPosts(res.data.posts)
    } catch (e) {
      const { name, message } = getApiError<keyof FormFields>(e)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, background: 'danger' })
    }
  }

  return (
    <div className="container-fluid py-4 position-relative">
      <Particles
        className="position-absolute top-0 start-0 w-100 h-100"
        loaded={async (container) => {
          const style = container.canvas.element?.style
          if (style) style.position = 'absolute'
        }}
        options={{
          background: { color: { value: '#000423' } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {},
            },
            modes: {},
          },
          particles: {
            color: { value: ['#5669FF', '#001CEF', '#0014AB'] },
            move: { enable: true },
            number: {
              density: {
                enable: true,
                area: 400,
              },
              value: 20,
            },
            shape: { type: 'circle' },
            size: { value: 30 },
          },
        }}
      />
      <Form
        name="searchPost"
        method="get"
        methods={methods}
        submitHandlers={{ submitHandler }}
        className="m-auto position-relative"
        style={{ maxWidth: 720 }}
      >
        <Label
          labelText="Search posts"
          htmlFor="search"
          className="fs-1 fw-bold text-white"
        />
        <div className="row">
          <div className="col-10 gx-2">
            <div className="row">
              <div className="col position-relative">
                <Input
                  name="query"
                  type="search"
                  placeholder="Nimbus 2000, invisibility cloak, ..."
                />
                <InputError
                  inputName="query"
                  className="m-0 p-2 rounded bg-dark position-absolute top-50"
                  style={{
                    transform: 'translateX(calc(-100% - 8px)) translateY(-50%)',
                    maxWidth: 300,
                  }}
                />
              </div>
            </div>
            <div className="row gx-2">
              <div className="col-3 gy-2 position-relative">
                <Input
                  name="minPrice"
                  type="number"
                  placeholder="Min. price"
                  aria-label="Minimum price"
                  defaultValue="0"
                />
                <InputError
                  inputName="minPrice"
                  className="m-0 p-2 rounded bg-dark position-absolute top-50"
                  style={{
                    transform: 'translateX(calc(-100% - 8px)) translateY(-50%)',
                    minWidth: 300,
                  }}
                />
              </div>
              <div className="col-3 gy-2 position-relative">
                <Input
                  name="maxPrice"
                  type="number"
                  placeholder="Max. price"
                  aria-label="Maximum price"
                  defaultValue="0"
                />
                <InputError
                  inputName="maxPrice"
                  className="m-0 p-2 rounded bg-dark position-absolute end-0"
                  style={{
                    transform: 'translateY(8px) translateX(-4px)',
                  }}
                />
              </div>
              <div className="col gy-2 position-relative">
                <Select
                  name="categories"
                  options={options}
                  aria-label="Categories"
                />
                <InputError
                  inputName="categories"
                  className="m-0 p-2 rounded bg-dark position-absolute start-0"
                  style={{
                    transform: 'translateY(8px) translateX(4px)',
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-2 gx-2">
            <Button
              type="submit"
              className="btn-primary w-100 h-100"
              gradient
              aria-label="Search"
            >
              <Search className="w-50 h-50" />
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}

export default HomeSearchPosts
