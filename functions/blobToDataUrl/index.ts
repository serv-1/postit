export default async function blobToDataUrl(blob: Blob) {
  const reader = new FileReader()

  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string)
    }

    reader.onerror = () => {
      reject(reader.error)
    }

    reader.readAsDataURL(blob)
  })
}
