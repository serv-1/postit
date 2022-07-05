import { nanoid } from 'nanoid'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import Discussion from '../../models/Discussion'
import addDiscussionApiSchema from '../../schemas/addDiscussionApiSchema'
import err from '../../utils/constants/errors'
import dbConnect from '../../utils/functions/dbConnect'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import validate from '../../utils/functions/validate'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const session = await getSession({ req })

  if (!session) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  const result = validate(addDiscussionApiSchema, req.body)

  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const reqBody = result.value
  const csrfTokenCookie = req.cookies['next-auth.csrf-token']

  if (!isCsrfTokenValid(csrfTokenCookie, reqBody.csrfToken)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const { message, ...rest } = reqBody

  await dbConnect()

  const discussion = new Discussion({
    messages: [message],
    ...rest,
    buyerId: session.id,
    channelName: nanoid(),
  })

  await discussion.save()

  res.status(201).end()
}

export default handler
