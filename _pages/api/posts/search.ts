import { NextApiRequest, NextApiResponse } from 'next'
import err from '../../../utils/constants/errors'
import searchPostSchema, {
  SearchPostSchema,
} from '../../../schemas/searchPostSchema'
import dbConnect from '../../../utils/functions/dbConnect'
import Post from '../../../models/Post'
import validate from '../../../utils/functions/validate'
import { Categories } from '../../../types/common'
import catchError from '../../../utils/functions/catchError'

interface Match {
  price?: { $gte?: number; $lte?: number }
  categories?: { $all: Categories[] }
}

interface TextClause {
  text: { query: string; path: string }
}

type Search = TextClause | { compound: { must: TextClause[] } }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  const cats = req.query.categories
  const result = validate(searchPostSchema, {
    ...req.query,
    categories: typeof cats === 'string' ? [cats] : cats,
  })

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const { query, page, minPrice, maxPrice, categories, address } = result.value

  await dbConnect()

  const $search: Search = address
    ? {
        compound: {
          must: [
            { text: { query, path: 'name' } },
            { text: { query: address, path: 'address' } },
          ],
        },
      }
    : { text: { query, path: 'name' } }

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

  const searchResult = await Post.aggregate([
    { $search },
    { $match },
    {
      $facet: {
        posts: [
          { $sort: { name: 1, _id: 1 } },
          { $skip: page ? (+page - 1) * 20 : 0 },
          {
            $set: {
              id: { $toString: '$_id' },
              price: { $divide: ['$price', 100] },
              image: { $arrayElemAt: ['$images', 0] },
            },
          },
          {
            $project: {
              _id: 0,
              id: 1,
              name: 1,
              price: 1,
              image: 1,
              address: 1,
            },
          },
          { $limit: 20 },
        ],
        totalPosts: [{ $count: 'total' }],
      },
    },
  ]).exec()

  res.status(200).json({
    posts: searchResult[0].posts,
    totalPosts: searchResult[0].totalPosts[0]?.total || 0,
    totalPages: Math.ceil(searchResult[0].totalPosts[0]?.total / 20) || 0,
  })
}

export default catchError(handler)
