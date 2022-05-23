import { NextApiRequest, NextApiResponse } from 'next'
import err from '../../../utils/constants/errors'
import searchPostSchema, {
  SearchPostSchema,
} from '../../../schemas/searchPostSchema'
import dbConnect from '../../../utils/functions/dbConnect'
import Post from '../../../models/Post'
import validate from '../../../utils/functions/validate'
import { Categories } from '../../../types/common'

interface Match {
  price?: { $gte?: number; $lte?: number }
  categories?: { $all: Categories[] }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  let queryCategories = req.query.categories as
    | SearchPostSchema['categories']
    | Categories

  if (queryCategories && !Array.isArray(queryCategories)) {
    queryCategories = [queryCategories]
  }

  const reqQuery = {
    query: req.query.query,
    page: +req.query.page || undefined,
    minPrice: +req.query.minPrice || undefined,
    maxPrice: +req.query.maxPrice || undefined,
    categories: queryCategories,
  } as SearchPostSchema

  const result = validate(searchPostSchema, reqQuery)

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const { query, page, minPrice, maxPrice, categories } = result.value

  try {
    await dbConnect()

    const $match: Match = {}

    if (minPrice && minPrice !== '0') {
      $match.price = { $gte: +minPrice * 100 }
    }

    if (maxPrice && maxPrice !== '0') {
      $match.price = { ...$match.price, $lte: +maxPrice * 100 }
    }

    if (categories) {
      $match.categories = { $all: categories }
    }

    const result = await Post.aggregate([
      { $search: { text: { query, path: 'name' } } },
      { $match },
      {
        $facet: {
          posts: [
            { $sort: { name: 1, _id: 1 } },
            { $skip: page ? (+page - 1) * 10 : 0 },
            {
              $set: {
                id: { $toString: '$_id' },
                price: { $divide: ['$price', 100] },
                image: {
                  $concat: [
                    '/static/images/posts/',
                    { $arrayElemAt: ['$images', 0] },
                  ],
                },
              },
            },
            {
              $unset: [
                '_id',
                '__v',
                'userId',
                'description',
                'categories',
                'images',
              ],
            },
            { $limit: 20 },
          ],
          totalPosts: [{ $count: 'total' }],
        },
      },
    ]).exec()

    res.status(200).json({
      posts: result[0].posts,
      totalPosts: result[0].totalPosts[0]?.total || 0,
      totalPages: Math.ceil(result[0].totalPosts[0]?.total / 20) || 0,
    })
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
