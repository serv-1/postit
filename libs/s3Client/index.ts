import { S3Client } from '@aws-sdk/client-s3'
import { AWS_ACCESS_KEY_ID_, AWS_REGION_, AWS_SECRET_ACCESS_KEY_ } from 'env'

const s3Client = new S3Client({
  region: AWS_REGION_,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_,
  },
})

export default s3Client
