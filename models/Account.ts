import { models, model, Schema, Model, Types } from 'mongoose'

export interface AccountModel {
  _id: Types.ObjectId
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
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  userId: Schema.Types.ObjectId,
  oauth_token_secret: String,
  oauth_token: String,
  session_state: String,
})

export default (models.Account as Model<AccountModel>) ||
  model<AccountModel>('Account', accountSchema)
