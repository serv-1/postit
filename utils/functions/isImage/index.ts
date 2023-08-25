const imageTypes = new Set(['image/jpeg', 'image/png', 'image/gif'])

export default function isImage(type: string) {
  return imageTypes.has(type)
}
