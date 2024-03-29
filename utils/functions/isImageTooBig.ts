/**
 * Verify if the given image size exceed 1mb.
 *
 * @param size the image size
 * @returns true if it is too big else false
 */
const isImageTooBig = (size: number) => {
  return size > 1048576
}

export default isImageTooBig
