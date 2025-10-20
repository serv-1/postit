import { models, model, Schema, type Model, Types } from 'mongoose'

export interface AccountDoc {
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
  session_state: string
}

const accountSchema = new Schema<AccountDoc>({
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
  session_state: String,
})

const Account =
  (models.Account as Model<AccountDoc>) || model('Account', accountSchema)

export default Account
