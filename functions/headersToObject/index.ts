export default function headersToObject(headers: Headers) {
  const obj: Record<string, string> = {}

  headers.forEach((value, key) => {
    obj[key] = value
  })

  return obj
}
