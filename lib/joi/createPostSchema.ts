import { Categories, IImage } from '../../types/common'
import { categoriesSchema } from './categoriesSchema'
import { csrfTokenSchema } from './csrfTokenSchema'
import { descriptionSchema } from './descriptionSchema'
import { imagesObjectSchema, imagesArraySchema } from './imagesSchema'
import { nameSchema } from './nameSchema'
import object from './object'
import { priceSchema } from './priceSchema'

interface CreatePostSchema {
  csrfToken: string
  name: string
  description: string
  categories: Categories[]
  price: number
}

export interface CreatePostClientSchema extends CreatePostSchema {
  images: FileList
}

export interface CreatePostServerSchema extends CreatePostSchema {
  images: IImage[]
}

const createPostSchema = {
  name: nameSchema,
  description: descriptionSchema,
  categories: categoriesSchema,
  price: priceSchema,
  csrfToken: csrfTokenSchema,
}

export const createPostClientSchema = object<CreatePostClientSchema>({
  ...createPostSchema,
  images: imagesObjectSchema,
})

export const createPostServerSchema = object<CreatePostServerSchema>({
  ...createPostSchema,
  images: imagesArraySchema,
})
