import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import Discussion from '../../../models/Discussion'
import csrfTokenSchema from '../../../schemas/csrfTokenSchema'
import err from '../../../utils/constants/errors'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import validate from '../../../utils/functions/validate'
import messageSchema, { MessageSchema } from '../../../schemas/messageSchema'
import { IDiscussion } from '../../../types/common'
import dbConnect from '../../../utils/functions/dbConnect'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  const session = await getSession({ req })
  if (!session) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  const csrfToken = req.query.csrfToken || req.body.csrfToken
  const result = validate<string>(csrfTokenSchema, csrfToken)

  if ('message' in result) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const csrfTokenCookie = req.cookies['next-auth.csrf-token']
  if (!isCsrfTokenValid(csrfTokenCookie, result.value)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  await dbConnect()

  const discussion = await Discussion.findById(id).exec()
  if (!discussion) {
    return res.status(404).json({ message: err.DISCUSSION_NOT_FOUND })
  }

  if (
    session.id !== discussion.buyerId?.toString() &&
    session.id !== discussion.sellerId?.toString()
  ) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  switch (req.method) {
    case 'GET': {
      const json: IDiscussion = {
        id: discussion._id.toString(),
        messages: discussion.messages.map((m) => ({
          message: m.message,
          createdAt: m.createdAt,
          isBuyerMsg: m.isBuyerMsg,
        })),
        postId: discussion.postId.toString(),
        postName: discussion.postName,
        channelName: 'private-chat-' + discussion.channelName,
      }

      if (discussion.buyerId) json.buyerId = discussion.buyerId.toString()
      if (discussion.sellerId) json.sellerId = discussion.sellerId.toString()

      res.status(200).json(json)
      break
    }
    case 'PUT': {
      const result = validate(messageSchema, req.body.message as MessageSchema)

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      await Discussion.findByIdAndUpdate(id, {
        $push: { messages: result.value },
      })
        .lean()
        .exec()

      break
    }
    case 'DELETE': {
      await Discussion.deleteOne({ _id: id }).lean().exec()
      break
    }
    default:
      return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  res.end()
}

export default handler
