import type { DiscussionsIdGetData } from 'app/api/discussions/[id]/types'
import Discussion from 'models/Discussion'
import { Types } from 'mongoose'

export default async function getDiscussion(id: Types.ObjectId | string) {
  return (
    await Discussion.aggregate<DiscussionsIdGetData>([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'posts',
        },
      },
      {
        $addFields: {
          post: {
            id: { $arrayElemAt: ['$posts._id', 0] },
            name: { $arrayElemAt: ['$posts.name', 0] },
          },
        },
      },
      { $unset: ['postId', 'posts'] },
    ])
  )[0]
}
