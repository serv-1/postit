import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import s3Client from 'libs/s3Client'
import env from 'utils/constants/env'

const deleteImage = async (Key: string) => {
  const input = { Bucket: env.AWS_BUCKET_NAME, Key }
  await s3Client.send(new DeleteObjectCommand(input))
}

export default deleteImage