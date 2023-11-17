import type { S3GetData, S3GetError } from 'app/api/s3/types'
import { DEFAULT, IMAGE_TOO_BIG } from 'constants/errors'
import ajax from 'libs/ajax'

export default async function sendImage(image: File) {
  let response = await ajax.get('/s3', { csrf: true })

  if (!response.ok) {
    const { message }: S3GetError = await response.json()

    throw new Error(message)
  }

  const { url, fields, key }: S3GetData = await response.json()
  const formData = new FormData()

  for (const k in fields) {
    formData.append(k, fields[k])
  }

  formData.append('file', image)

  response = await fetch(url, { method: 'POST', body: formData })

  if (!response.ok) {
    throw new Error(response.status === 400 ? IMAGE_TOO_BIG : DEFAULT)
  }

  return key
}
