import { NextApiRequest, NextApiResponse } from 'next'
import err from '../../../utils/constants/errors'
import {
  searchPostSchema,
  SearchPostsSchema,
} from '../../../lib/joi/searchPostSchema'
import dbConnect from '../../../utils/functions/dbConnect'
import Post from '../../../models/Post'
import validate from '../../../utils/functions/validate'
import { Categories, Post as IPost } from '../../../types/common'

interface Filter {
  $text: { $search: string }
  price?: { $gte: number; $lte?: number }
  $and?: { categories: { $in: Categories[] } }[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  let queryCategories = req.query['categories[]'] as
    | SearchPostsSchema['categories']
    | Categories

  if (queryCategories && !Array.isArray(queryCategories)) {
    queryCategories = [queryCategories]
  }

  const reqQuery = {
    query: req.query.query,
    page: req.query.page,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    categories: queryCategories,
  } as SearchPostsSchema

  const result = validate(searchPostSchema, reqQuery)

  if ('message' in result) {
    return res.status(422).json({ name: result.name, message: result.message })
  }

  const { query, page, minPrice, maxPrice, categories } = result.value

  const filter: Filter = { $text: { $search: `"${query}"` } }

  if (minPrice || maxPrice) {
    filter.price = { $gte: (minPrice ? +minPrice : 0) * 100 }
    if (maxPrice && maxPrice !== '0') filter.price.$lte = +maxPrice * 100
  }

  if (categories) {
    filter.$and = categories.map((category) => ({
      categories: { $in: [category] },
    }))
  }

  try {
    await dbConnect()

    const totalPosts = await Post.countDocuments(filter).exec()
    const totalPages = Math.ceil(totalPosts / 20)

    const skip = page ? (+page - 1) * 20 : 0
    const posts = await Post.find(filter).skip(skip).limit(20).lean().exec()
    const formatedPosts: IPost[] = []

    for (const post of posts) {
      formatedPosts.push({
        ...post,
        id: post._id.toString(),
        price: post.price / 100,
        images: post.images.map((image) => '/static/images/posts/' + image),
        userId: post.userId.toString(),
      })
    }

    res.status(200).json({ posts: formatedPosts, totalPages, totalPosts })
  } catch (e) {
    res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
