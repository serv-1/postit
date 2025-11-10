import type { SearchParams, UnPromise } from 'types'

export default function searchParamsToString(
  searchParams: UnPromise<SearchParams>
) {
  let str = ''

  for (const name in searchParams) {
    if (str && str[str.length - 1] !== '&') {
      str += '&'
    }

    const value = searchParams[name]

    if (typeof value === 'object') {
      for (let i = 0; i < value.length; i++) {
        str += name + '=' + value[i] + (i + 1 !== value.length ? '&' : '')
      }
    } else {
      str += name + '=' + value
    }
  }

  return str
}
