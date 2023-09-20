import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import s3Client from 'libs/s3Client'
import { AWS_BUCKET_NAME } from 'env'

export default async function deleteImage(Key: string) {
  const input = { Bucket: AWS_BUCKET_NAME, Key }
  await s3Client.send(new DeleteObjectCommand(input))
}
