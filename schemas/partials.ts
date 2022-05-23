import categoriesSchema from './categoriesSchema'
import csrfTokenSchema from './csrfTokenSchema'
import descriptionSchema from './descriptionSchema'
import nameSchema from './nameSchema'
import priceSchema from './priceSchema'

export const addPost = {
  name: nameSchema.required(),
  description: descriptionSchema.required(),
  categories: categoriesSchema.required().min(1),
  price: priceSchema.required().min(1),
  csrfToken: csrfTokenSchema,
}

export const updatePost = {
  name: nameSchema.allow(''),
  description: descriptionSchema.allow(''),
  categories: categoriesSchema,
  price: priceSchema.allow('').min(1),
  csrfToken: csrfTokenSchema,
}
