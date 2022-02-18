/**
 * Add commas to the given number.
 *
 * @param n integer or floating point number
 * @returns the number separated by commas
 */
const addCommasToNb = (n: number) => {
  const parts = n.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export default addCommasToNb
