import { isValidObjectId, Types } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/User'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  try {
    await dbConnect()

    const user = await User.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'posts',
          let: { postsIds: '$postsIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$postsIds'] } } },
            {
              $set: {
                id: { $toString: '$_id' },
                price: { $divide: ['$price', 100] },
                images: {
                  $map: {
                    input: '$images',
                    as: 'image',
                    in: { $concat: ['/static/images/posts/', '$$image'] },
                  },
                },
              },
            },
            { $unset: ['_id', '__v', 'userId'] },
          ],
          as: 'posts',
        },
      },
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
      { $unset: ['_id', '__v', 'password', 'emailVerified', 'postsIds'] },
    ]).exec()

    if (!user.length) {
      return res.status(404).json({ message: err.USER_NOT_FOUND })
    }

    res.status(200).json(user[0])
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
