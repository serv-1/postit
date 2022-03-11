import object from './object'
import { csrfTokenSchema } from './csrfTokenSchema'
import { nameSchema } from './nameSchema'
import { descriptionSchema } from './descriptionSchema'
import { categoriesSchema } from './categoriesSchema'
import { priceSchema } from './priceSchema'
import { imagesArraySchema, imagesObjectSchema } from './imagesSchema'
import { Categories, Image } from '../../types/common'

interface PostsIdPutSchema {
  csrfToken: string
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
}

export interface PostsIdPutClientSchema extends PostsIdPutSchema {
  images?: FileList
}

export interface PostsIdPutServerSchema extends PostsIdPutSchema {
  images?: Image[]
}

const postsIdPutSchema = {
  csrfToken: csrfTokenSchema,
  name: nameSchema.allow('').optional(),
  description: descriptionSchema.allow('').optional(),
  categories: categoriesSchema.min(0).optional(),
  price: priceSchema.optional(),
}

export const postsIdPutClientSchema = object<PostsIdPutClientSchema>({
  ...postsIdPutSchema,
  images: imagesObjectSchema.min(0).optional(),
})

export const postsIdPutServerSchema = object<PostsIdPutServerSchema>({
  ...postsIdPutSchema,
  images: imagesArraySchema.min(0).optional(),
})
