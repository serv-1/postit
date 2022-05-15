/**
 * Format the given string to be used in Url.
 *
 * @param str string to format
 * @returns the given string formatted
 */
const formatToUrl = (str: string) => {
  const NotAllowedChars = /[^a-zA-Z0-9-_.~]/g
  return str
    .normalize('NFKD')
    .replaceAll(' ', '-')
    .replaceAll(NotAllowedChars, '')
}

export default formatToUrl
