import { NextApiRequest, NextApiResponse } from 'next'
import pusher from '../../utils/functions/initPusher'
import err from '../../utils/constants/errors'
import validate from '../../utils/functions/validate'
import { getSession } from 'next-auth/react'
import chatApiSchema from '../../schemas/chatApiSchema'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const session = await getSession({ req })
  if (!session) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  const result = validate(chatApiSchema, req.body)
  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const { channelName, message } = result.value

  pusher.trigger(channelName, 'message', message)

  res.end()
}

export default handler
