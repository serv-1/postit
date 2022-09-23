import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import s3Client from '../../libs/s3Client'
import env from '../constants/env'

/**
 * Delete an image in the s3 bucket.
 *
 * @param Key the object key of the image to delete
 */
const deleteImage = async (Key: string) => {
  const input = { Bucket: env.AWS_BUCKET_NAME, Key }
  await s3Client.send(new DeleteObjectCommand(input))
}

export default deleteImage
