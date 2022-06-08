import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import categories from '../../../../categories'
import Accordion from '../../../../components/Accordion'
import ExpandedImageModal from '../../../../components/ExpandedImageModal'
import Form from '../../../../components/Form'
import Header from '../../../../components/Header'
import HeaderDropdownMenu from '../../../../components/HeaderDropdownMenu'
import Input from '../../../../components/Input'
import InputError from '../../../../components/InputError'
import Select from '../../../../components/Select'
import TextArea from '../../../../components/TextArea'
import { useToast } from '../../../../contexts/toast'
import { Entries, IImage, IPost, IUserPost } from '../../../../types/common'
import addSpacesToNb from '../../../../utils/functions/addSpacesToNb'
import getAxiosError from '../../../../utils/functions/getAxiosError'
import isImageValid from '../../../../utils/functions/isImageValid'
import readAsDataUrl from '../../../../utils/functions/readAsDataUrl'
import GlassWrapper from '../../../../components/GlassWrapper'
import ShapeContainer from '../../../../components/ShapeContainer'
import Button from '../../../../components/Button'
import updatePostSchema, {
  UpdatePostSchema,
} from '../../../../schemas/updatePostSchema'
import { getCsrfToken } from 'next-auth/react'
import PostLocationModal from '../../../../components/PostLocationModal'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id

  try {
    const res = await axios.get<IPost>(`http://localhost:3000/api/posts/${id}`)
    return {
      props: {
        post: res.data,
        background: 'bg-linear-page',
        csrfToken: await getCsrfToken(ctx),
      },
    }
  } catch (e) {
    return { notFound: true }
  }
}

type FilteredData = Omit<UpdatePostSchema, 'images'> & {
  images?: IImage[]
}

interface UpdatePostProps {
  post: IUserPost
  csrfToken?: string
}

const UpdatePost = ({ post, csrfToken }: UpdatePostProps) => {
  const methods = useForm<UpdatePostSchema>({
    resolver: joiResolver(updatePostSchema),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdatePostSchema> = async (data) => {
    const { images, ...rest } = data
    const filteredData: FilteredData = rest

    for (const entry of Object.entries(filteredData) as Entries<typeof data>) {
      if (!entry[1]) delete filteredData[entry[0]]
    }

    if (images) {
      for (let i = 0; i < images.length; i++) {
        const message = isImageValid(images[i])

        if (message) {
          return methods.setError('images', { message }, { shouldFocus: true })
        }

        const result = await readAsDataUrl<IImage['ext']>(images[i])

        if (typeof result === 'string') {
          methods.setError('images', { message: result }, { shouldFocus: true })
          return
        }

        if (filteredData.images) {
          filteredData.images.push(result)
        } else {
          filteredData.images = [result]
        }
      }
    }

    try {
      await axios.put(
        'http://localhost:3000/api/posts/' + post.id,
        filteredData
      )
      setToast({ message: 'The post has been updated! 🎉' })
    } catch (e) {
      type FieldsNames = keyof Required<UpdatePostSchema>
      const { message, name } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Head>
        <title>Update {post.name} - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header className="w-full max-w-[450px] py-4 mb-8 md:max-w-full">
          <HeaderDropdownMenu />
        </Header>
        <GlassWrapper padding="p-32">
          <ShapeContainer>
            <h1>Update the post</h1>
            <p className="my-16">Only fill the inputs you want to update.</p>
            <Form
              name="createPost"
              method="post"
              methods={methods}
              submitHandler={submitHandler}
              csrfToken={csrfToken}
              className="h-full"
            >
              <Accordion title="Name" id="name" headingLevel={2}>
                <div className="mb-16">
                  Actual name
                  <div className="bg-fuchsia-100 rounded-8 p-8">
                    {post.name}
                  </div>
                </div>
                <div>
                  <label htmlFor="name">New name</label>
                  <Input type="text" name="name" />
                  <InputError inputName="name" />
                </div>
              </Accordion>

              <Accordion title="Description" id="description" headingLevel={2}>
                <div className="mb-16">
                  Actual description
                  <div className="bg-fuchsia-100 rounded-8 p-8">
                    {post.description}
                  </div>
                </div>
                <div>
                  <label htmlFor="description">New description</label>
                  <TextArea name="description" />
                  <InputError inputName="description" />
                </div>
              </Accordion>

              <Accordion title="Categories" id="categories" headingLevel={2}>
                <div className="mb-16">
                  Actual categories
                  <div className="bg-fuchsia-100 rounded-8 p-8">
                    {post.categories.join(', ')}
                  </div>
                </div>
                <div>
                  <label htmlFor="categories">New Categories</label>
                  <Select name="categories" options={options} />
                  <InputError inputName="categories" />
                </div>
              </Accordion>

              <Accordion title="Price" id="price" headingLevel={2}>
                <div className="mb-16">
                  Actual price
                  <div className="bg-fuchsia-100 rounded-8 p-8">
                    {addSpacesToNb(post.price)}€
                  </div>
                </div>
                <div>
                  <label htmlFor="price">New price</label>
                  <Input type="number" name="price" addOn="€" />
                  <InputError inputName="price" />
                </div>
              </Accordion>

              <Accordion title="Images" id="images" headingLevel={2}>
                <div className="mb-16">
                  Actual images
                  <div className="flex flex-row flex-nowrap gap-x-4">
                    {[0, 1, 2, 3, 4].map((i) => {
                      if (post.images[i]) {
                        return (
                          <ExpandedImageModal
                            key={post.images[i]}
                            src={post.images[i]}
                            btnClass="w-full aspect-square focus:outline-4 focus:outline-dashed focus:outline-fuchsia-600 rounded-8"
                            btnImgClass="rounded-8"
                          />
                        )
                      }
                      return (
                        <div
                          key={i}
                          className="w-full rounded-8 aspect-square bg-fuchsia-100"
                        ></div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="images">New images</label>
                  <Input type="file" name="images" />
                  <InputError inputName="images" />
                </div>
              </Accordion>

              <Accordion title="Location" id="location" headingLevel={2}>
                <div className="mb-16">
                  Actual location
                  <div className="bg-fuchsia-100 rounded-8 p-8">
                    {post.location}
                  </div>
                </div>
                <div>
                  <label htmlFor="location">New location</label>
                  <PostLocationModal />
                </div>
              </Accordion>

              <div className="flex justify-end">
                <Button color="primary">Update</Button>
              </div>
            </Form>
          </ShapeContainer>
        </GlassWrapper>
      </div>
    </>
  )
}

UpdatePost.needAuth = true
UpdatePost.need2RowsGrid = true

export default UpdatePost
