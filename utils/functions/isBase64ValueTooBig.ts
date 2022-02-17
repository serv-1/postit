/**
 * Tell if the size of the base64 original value is under or equal
 * to the given size limit.
 *
 * @param value base64 encoded value
 * @param sizeLimit size limit which the value has to be under
 * @return true if the value is inferior or equal to sizeLimit else false
 */
const isBase64ValueTooBig = (value: string, sizeLimit: number) => {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0

  if (value.length * (3 / 4) - padding > sizeLimit) {
    return true
  }

  return false
}

export default isBase64ValueTooBig
