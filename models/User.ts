import { models, model, Schema, Model } from 'mongoose'
import {
  EMAIL_REQUIRED,
  NAME_MAX,
  NAME_REQUIRED,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from '../utils/errors'
import { readFileSync } from 'fs'
import { Buffer } from 'buffer'
import { join } from 'path'

const path = join('public/static/images/default.jpg')
const base64Data = readFileSync(path, 'base64')

export const defaultImage = {
  data: Buffer.from(base64Data, 'base64'),
  contentType: 'image/jpeg',
}

export interface IUser {
  name: string
  email: string
  password?: string
  emailVerified?: Date
  image: {
    data: Buffer
    contentType: string
  }
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, NAME_REQUIRED],
    maxLength: [90, NAME_MAX],
  },
  email: {
    type: String,
    required: [true, EMAIL_REQUIRED],
    unique: true,
  },
  password: {
    type: String,
    min: [10, PASSWORD_MIN],
    max: [20, PASSWORD_MAX],
  },
  emailVerified: Date,
  image: {
    type: {
      data: Buffer,
      contentType: String,
    },
    default: defaultImage,
  },
})

export default (models.User as Model<IUser>) || model<IUser>('User', userSchema)
