export interface S3GetData {
  url: string
  fields: Record<string, string>
  key: string
}

export interface S3GetError {
  message: string
}
