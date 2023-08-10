export default function formatToUrl(str: string) {
  const notAllowedChars = /[^a-zA-Z0-9-_.~]/g

  return str
    .normalize('NFKD')
    .replaceAll(' ', '-')
    .replaceAll(notAllowedChars, '')
}
