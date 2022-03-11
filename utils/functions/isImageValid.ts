import err from '../constants/errors'

/**
 * Verify if the given image is valid.
 *
 * @param image the image to validate
 * @returns undefined if image is a valid image else an error message
 */
const isImageValid = (image: File) => {
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(image.type)) {
    return err.IMAGE_INVALID
  } else if (image.size > 1000000) {
    return err.IMAGE_TOO_BIG
  }
}

export default isImageValid
