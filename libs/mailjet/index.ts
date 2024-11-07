import { MJ_API_PRIVATE_KEY, MJ_API_PUBLIC_KEY } from 'env'
import Mailjet from 'node-mailjet'

const mailjet = Mailjet.apiConnect(MJ_API_PUBLIC_KEY, MJ_API_PRIVATE_KEY)

export default mailjet
