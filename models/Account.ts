import { models, model, Schema, Model, Types } from 'mongoose'

export interface AccountModel {
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope: string
  id_token: string
  userId: Types.ObjectId
  oauth_token_secret: string
  oauth_token: string
  session_state: string
}

const accountSchema = new Schema<AccountModel>({
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String, required: true },
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: { type: String, required: true },
  id_token: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  oauth_token_secret: { type: String, required: true },
  oauth_token: { type: String, required: true },
  session_state: { type: String, required: true },
})

export default (models.Account as Model<AccountModel>) ||
  model<AccountModel>('Account', accountSchema)
