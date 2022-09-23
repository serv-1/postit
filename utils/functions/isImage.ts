/**
 * Verify if the given file type is an image type.
 *
 * @param type the file type
 * @returns true if it is an image else false
 */
const isImage = (type: string) => {
  return ['image/jpeg', 'image/png', 'image/gif'].includes(type)
}

export default isImage
