import { isValidObjectId } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  try {
    await dbConnect()
    const user = await User.findOne({ _id: id }).lean().exec()

    if (!user) {
      return res.status(404).json({ message: err.USER_NOT_FOUND })
    }

    const fname = user.image.split('.')[0]
    const path = '/static/images' + (fname === 'default' ? '/' : '/users/')
    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: path + user.image,
      postsIds: user.postsIds,
    })
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
