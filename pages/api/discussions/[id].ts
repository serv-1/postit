import { isValidObjectId, Types } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
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
import { IDiscussion } from '../../../types/common'
import getServerPusher from '../../../utils/functions/getServerPusher'

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

  const lookup = (user: 'buyer' | 'seller') => ({
    $lookup: {
      from: 'users',
      let: { [user + 'Id']: '$' + user + 'Id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$' + user + 'Id'] } } },
        {
          $set: {
            id: { $toString: '$_id' },
            image: {
              $cond: [
                { $regexMatch: { input: '$image', regex: /default/ } },
                { $concat: ['/static/images/', '$image'] },
                { $concat: ['/static/images/users/', '$image'] },
              ],
            },
          },
        },
        {
          $project: { _id: 0, id: 1, name: 1, image: 1 },
        },
      ],
      as: user,
    },
  })

  const discussion = (
    await Discussion.aggregate<IDiscussion>([
      { $match: { _id: new Types.ObjectId(id) } },
      lookup('buyer'),
      lookup('seller'),
      {
        $set: {
          id: { $toString: '$_id' },
          messages: {
            $map: {
              input: '$messages',
              as: 'message',
              in: {
                $setField: {
                  field: 'userId',
                  input: '$$message',
                  value: { $toString: '$$message.userId' },
                },
              },
            },
          },
          buyer: {
            $cond: [
              { $eq: [{ $size: '$buyer' }, 0] },
              { name: '[DELETED]', image: '/static/images/default.jpg' },
              { $arrayElemAt: ['$buyer', 0] },
            ],
          },
          seller: {
            $cond: [
              { $eq: [{ $size: '$seller' }, 0] },
              { name: '[DELETED]', image: '/static/images/default.jpg' },
              { $arrayElemAt: ['$seller', 0] },
            ],
          },
          channelName: { $concat: ['private-encrypted-', '$channelName'] },
        },
      },
      {
        $set: {
          messages: {
            $map: {
              input: '$messages',
              as: 'message',
              in: { $unsetField: { field: '_id', input: '$$message' } },
            },
          },
        },
      },
      { $unset: ['_id', '__v', 'buyerId', 'sellerId'] },
    ])
  )[0]

  if (!discussion) {
    return res.status(404).json({ message: err.DISCUSSION_NOT_FOUND })
  }

  if (
    session.id !== discussion.buyer.id &&
    session.id !== discussion.seller.id
  ) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  const userId =
    session.id === discussion.buyer.id
      ? discussion.seller.id
      : discussion.buyer.id

  switch (req.method) {
    case 'GET': {
      res.status(200).json(discussion)
      break
    }
    case 'PUT': {
      const buyer = await User.findById(discussion.buyer.id).lean().exec()
      const seller = await User.findById(discussion.seller.id).lean().exec()

      const buyerDiscIds = buyer?.discussionsIds.map((id) => id.toString())
      const sellerDiscIds = seller?.discussionsIds.map((id) => id.toString())

      if (
        !buyer ||
        !seller ||
        !buyerDiscIds?.includes(id) ||
        !sellerDiscIds?.includes(id)
      ) {
        return res.status(400).json({ message: err.CANNOT_SEND_MSG })
      }

      const result = validate(updateDiscussionApiSchema, req.body)

      if ('message' in result) {
        return res.status(422).json({ message: result.message })
      }

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
        const pusher = getServerPusher()

        pusher.trigger('private-' + user.channelName, 'new-message', '')
        pusher.trigger(discussion.channelName, 'new-message', {
          message: lastMsg.message,
          createdAt: lastMsg.createdAt,
          userId: lastMsg.userId.toString(),
          seen: lastMsg.seen,
        })
      } else {
        const messages = [...discussion.messages]

        for (let i = 0; i < messages.length; i++) {
          if (messages[i].userId === userId && !messages[i].seen) {
            messages[i].seen = true
          }
        }

        await Discussion.findByIdAndUpdate(id, { $set: { messages } })
          .lean()
          .exec()

        const user = (await User.findById(session.id)
          .lean()
          .exec()) as UserModel

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
    default:
      return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  res.end()
}

export default handler
