import err from '../constants/errors'

interface EncodedFile<T> {
  base64: string
  ext: T
}

/**
 * Use the FileReader method readAsDataURL to get the given file's extension and base64.
 *
 * @param file the file to read as data URL
 * @returns a promise resolving in an object with the file's extension and base64 or in an error message
 */
const readAsDataUrl = async <T extends string>(file: File) => {
  return new Promise<string | EncodedFile<T>>((resolve) => {
    const reader = new FileReader()

    reader.onerror = async () => {
      resolve(err.DATA_INVALID)
    }

    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1]
      const fnameParts = file.name.split('.')
      const ext = fnameParts[fnameParts.length - 1] as T
      resolve({ base64, ext })
    }

    reader.readAsDataURL(file)
  })
}

export default readAsDataUrl
