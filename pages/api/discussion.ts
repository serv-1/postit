import { NextApiRequest, NextApiResponse } from 'next'
import Discussion from '../../models/Discussion'
import User from '../../models/User'
import addDiscussionApiSchema from '../../schemas/addDiscussionApiSchema'
import env from '../../utils/constants/env'
import err from '../../utils/constants/errors'
import catchError from '../../utils/functions/catchError'
import dbConnect from '../../utils/functions/dbConnect'
import getServerPusher from '../../utils/functions/getServerPusher'
import getSessionAndUser from '../../utils/functions/getSessionAndUser'
import isCsrfTokenValid from '../../utils/functions/isCsrfTokenValid'
import validate from '../../utils/functions/validate'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate(addDiscussionApiSchema, req.body)
  if ('message' in result) {
    return res.status(422).json({ message: result.message })
  }

  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] || ''
  if (!isCsrfTokenValid(csrfTokenCookie, result.value.csrfToken)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  if (result.value.sellerId === session.id) {
    return res.status(422).json({ message: err.ID_INVALID })
  }

  const { message, postId, sellerId } = result.value
  const { id } = session

  const discussion = await Discussion.findOne({ buyerId: id, postId })
    .lean()
    .exec()

  if (discussion) {
    return res.status(409).json({ message: err.DISCUSSION_ALREADY_EXISTS })
  }

  await dbConnect()

  const newDiscussion = new Discussion({
    messages: [{ message, userId: id }],
    buyerId: id,
    ...result.value,
    postId,
  })

  await newDiscussion.save()

  const seller = await User.findById(sellerId).lean().exec()

  if (!seller) {
    return res.status(404).json({ message: err.USER_NOT_FOUND })
  }

  await getServerPusher().trigger(
    ['private-' + session.channelName, 'private-' + seller.channelName],
    'discussion-created',
    { discussionId: newDiscussion._id.toString(), userId: id }
  )

  res.status(201).json({ id: newDiscussion._id.toString() })
}

export default catchError(handler)
