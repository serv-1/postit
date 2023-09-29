import Joi from 'joi'
import { MAX_IMAGE_SIZE } from 'constants/index'
import isImage from 'functions/isImage'
import {
  IMAGES_INVALID,
  IMAGES_MAX,
  IMAGE_INVALID,
  IMAGE_TOO_BIG,
} from 'constants/errors'

const imageList = Joi.object()
  .custom((value, helpers) => {
    const files: File[] = Array.from(value)

    if (files.length > 5) {
      return helpers.error('images.max')
    }

    for (const file of files) {
      if (!isImage(file)) {
        return helpers.error('image.type')
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return helpers.error('image.size')
      }
    }

    return files
  })
  .messages({
    'object.base': IMAGES_INVALID,
    'images.max': IMAGES_MAX,
    'image.type': IMAGE_INVALID,
    'image.size': IMAGE_TOO_BIG,
  })

export default imageList
