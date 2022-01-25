import Joi from 'joi'
import err from '../../utils/constants/errors'
import imageSchema from './imageSchema'
import object from './object'

export const imagesObjectSchema = object().required().min(1).max(5).messages({
  'object.base': err.IMAGES_INVALID,
  'any.required': err.IMAGES_REQUIRED,
  'object.min': err.IMAGES_REQUIRED,
  'object.max': err.IMAGES_MAX,
})

export const imagesArraySchema = Joi.array()
  .items(imageSchema)
  .required()
  .min(1)
  .max(5)
  .messages({
    'array.base': err.IMAGES_INVALID,
    'any.required': err.IMAGES_REQUIRED,
    'array.excludes': err.IMAGES_INVALID,
    'array.includes': err.IMAGES_INVALID,
    'array.includesRequiredBoth': err.IMAGES_INVALID,
    'array.includesRequiredKnowns': err.IMAGES_INVALID,
    'array.includesRequiredUnKnowns': err.IMAGES_INVALID,
    'array.min': err.IMAGES_REQUIRED,
    'array.max': err.IMAGES_MAX,
  })
