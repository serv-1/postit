/**
 * Format the given string to be used in Url.
 *
 * @param str string to format
 * @returns the given string formatted
 */
const formatForUrl = (str: string) => {
  const allowedChars = /[^a-zA-Z0-9-_.~]/g
  return str.replaceAll(' ', '-').replaceAll(allowedChars, '')
}

export default formatForUrl
