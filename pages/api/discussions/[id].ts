import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import Discussion, {
  DiscussionModel,
  MessageModel,
} from '../../../models/Discussion'
import csrfTokenSchema from '../../../schemas/csrfTokenSchema'
import err from '../../../utils/constants/errors'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import validate from '../../../utils/functions/validate'
import dbConnect from '../../../utils/functions/dbConnect'
import updateDiscussionApiSchema from '../../../schemas/updateDiscussionApiSchema'
import User, { UserModel } from '../../../models/User'
import getServerPusher from '../../../utils/functions/getServerPusher'
import getSessionAndUser from '../../../utils/functions/getSessionAndUser'
import catchError from '../../../utils/functions/catchError'
import env from '../../../utils/constants/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const id = req.query.id as string
  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const csrfToken = req.query.csrfToken || req.body.csrfToken
  const result = validate<string>(csrfTokenSchema, csrfToken)
  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] || ''

  if (!isCsrfTokenValid(csrfTokenCookie, result.value || '')) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  await dbConnect()

  const discussion = await Discussion.findById(id).lean().exec()
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
      const buyer = await User.findById(discussion.buyerId).lean().exec()
      const seller = await User.findById(discussion.sellerId).lean().exec()

      return res.status(200).json({
        id: discussion._id.toString(),
        postId: discussion.postId?.toString(),
        postName: discussion.postName,
        channelName: discussion.channelName,
        messages: discussion.messages.map((m) => ({
          userId: m.userId.toString(),
          message: m.message,
          createdAt: m.createdAt,
          seen: m.seen,
        })),
        buyer: {
          id: buyer?._id.toString(),
          name: buyer ? buyer.name : '[DELETED]',
          image: buyer?.image,
        },
        seller: {
          id: seller?._id.toString(),
          name: seller ? seller.name : '[DELETED]',
          image: seller?.image,
        },
      })
    }
    case 'PUT': {
      const buyer = await User.findById(discussion.buyerId).lean().exec()
      const seller = await User.findById(discussion.sellerId).lean().exec()

      const buyerDiscIds = buyer?.discussionsIds.map((id) => id.toString())
      const sellerDiscIds = seller?.discussionsIds.map((id) => id.toString())

      if (
        !buyer ||
        !seller ||
        !buyerDiscIds?.includes(id) ||
        !sellerDiscIds?.includes(id)
      ) {
        return res.status(409).json({ message: err.CANNOT_SEND_MSG })
      }

      const result = validate(updateDiscussionApiSchema, req.body)

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

      const userId =
        session.id === discussion.buyerId?.toString()
          ? discussion.sellerId?.toString()
          : discussion.buyerId?.toString()

      if ('message' in result.value) {
        await Discussion.findByIdAndUpdate(id, {
          $push: {
            messages: [{ message: result.value.message, userId: session.id }],
          },
        })
          .lean()
          .exec()

        const user = (await User.findByIdAndUpdate(userId, {
          hasUnseenMessages: true,
        })
          .lean()
          .exec()) as UserModel

        const updatedDiscussion = (await Discussion.findById(id)
          .lean()
          .exec()) as DiscussionModel

        const { messages } = updatedDiscussion
        const lastMsg = messages[messages.length - 1] as MessageModel

        await getServerPusher().triggerBatch([
          {
            channel: 'private-' + user.channelName,
            name: 'new-message',
            data: '',
          },
          {
            channel: 'private-encrypted-' + discussion.channelName,
            name: 'new-message',
            data: {
              message: lastMsg.message,
              createdAt: lastMsg.createdAt,
              userId: lastMsg.userId.toString(),
              seen: lastMsg.seen,
            },
          },
        ])
      } else {
        const messages = [...discussion.messages]

        for (let i = 0; i < messages.length; i++) {
          if (messages[i].userId.toString() === userId && !messages[i].seen) {
            messages[i].seen = true
          }
        }

        await Discussion.findByIdAndUpdate(id, { $set: { messages } })
          .lean()
          .exec()

        const discussions = await Discussion.find({
          _id: { $in: user.discussionsIds.filter((i) => i.toString() !== id) },
        })

        let hasUnseenMessages = false

        for (const discussion of discussions) {
          const lastMsg = discussion.messages[discussion.messages.length - 1]

          if (!lastMsg.seen) {
            hasUnseenMessages = true
            break
          }
        }

        if (!hasUnseenMessages) {
          await User.findByIdAndUpdate(session.id, { hasUnseenMessages })
            .lean()
            .exec()
        }
      }
      break
    }
    case 'DELETE': {
      await Discussion.deleteOne({ _id: id }).lean().exec()
      break
    }
  }

  return res.status(204).end()
}

export default catchError(handler)
