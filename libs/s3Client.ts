import { S3Client } from '@aws-sdk/client-s3'
import env from '../utils/constants/env'

const s3Client = new S3Client({ region: env.AWS_REGION })

export default s3Client
