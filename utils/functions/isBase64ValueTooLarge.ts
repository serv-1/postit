const isBase64ValueTooLarge = (base64: string, sizeLimit: number) => {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0

  if (base64.length * (3 / 4) - padding > sizeLimit) {
    return true
  }

  return false
}

export default isBase64ValueTooLarge
