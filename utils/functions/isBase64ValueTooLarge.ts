const isBase64ValueTooLarge = (base64Uri: string, sizeLimit: number) => {
  const base64: string = base64Uri.split(',')[1]
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0

  if (base64.length * (3 / 4) - padding > sizeLimit) {
    return true
  }

  return false
}

export default isBase64ValueTooLarge
