import { Schema, models, type Types, Model, model } from 'mongoose'

export interface TokenDoc {
  userId: Types.ObjectId
  token: string
  createdAt: Date
}

const tokenSchema = new Schema<TokenDoc>({
  userId: Schema.Types.ObjectId,
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 180 },
})

const Token = (models.Token as Model<TokenDoc>) || model('Token', tokenSchema)

export default Token
