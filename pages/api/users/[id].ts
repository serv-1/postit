import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import catchError from '../../../utils/functions/catchError'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  await dbConnect()

  const user = await User.findById(id).lean().exec()

  if (!user) {
    return res.status(404).json({ message: err.USER_NOT_FOUND })
  }

  res.status(200).json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    hasUnseenMessages: user.hasUnseenMessages,
    channelName: 'private-' + user.channelName,
    image: '/static/images/users/' + user.image,
    postsIds: user.postsIds.map((i) => i.toString()),
    favPostsIds: user.favPostsIds.map((i) => i.toString()),
    discussionsIds: user.discussionsIds.map((i) => i.toString()),
  })
}

export default catchError(handler)
