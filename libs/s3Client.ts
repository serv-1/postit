import { S3Client } from '@aws-sdk/client-s3'
import env from '../utils/constants/env'

const s3Client = new S3Client({
  region: env.AWS_REGION_,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID_,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY_,
  },
})

export default s3Client
