import Joi from 'joi'
import { MAX_IMAGE_SIZE } from 'utils/constants'
import err from 'utils/constants/errors'
import isImage from 'utils/functions/isImage'

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
    'object.base': err.IMAGES_INVALID,
    'images.max': err.IMAGES_MAX,
    'image.type': err.IMAGE_INVALID,
    'image.size': err.IMAGE_TOO_BIG,
  })

export default imageList
