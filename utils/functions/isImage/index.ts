export default function isImage(file: File) {
  return (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/gif'
  )
}
