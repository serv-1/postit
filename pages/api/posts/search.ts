import { NextApiRequest, NextApiResponse } from 'next'
import err from '../../../utils/constants/errors'
import searchPostSchema from '../../../lib/joi/searchPostSchema'
import dbConnect from '../../../utils/functions/dbConnect'
import Post, { IPost } from '../../../models/Post'
import validateSchema from '../../../utils/functions/validateSchema'

interface Filter {
  $text: { $search: string }
  price?: { $gte: number; $lte?: number }
  $and?: { categories: { $in: string[] } }[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).send({ message: err.METHOD_NOT_ALLOWED })
  }

  const data = { ...req.query }
  const queryCategories = data['categories[]']

  if (queryCategories) {
    if (Array.isArray(queryCategories)) {
      data.categories = queryCategories
    } else {
      data.categories = [queryCategories]
    }

    delete data['categories[]']
  }

  validateSchema(searchPostSchema, data, res, true)

  const { query, page, minPrice, maxPrice, categories } = data

  const filter: Filter = { $text: { $search: `"${query}"` } }

  if (minPrice || maxPrice) {
    filter.price = { $gte: (minPrice ? +minPrice : 0) * 100 }
    if (maxPrice && maxPrice !== '0') filter.price.$lte = +maxPrice * 100
  }

  if (categories) {
    filter.$and = (categories as string[]).map((category) => ({
      categories: { $in: [category] },
    }))
  }

  try {
    await dbConnect()

    const totalPosts = await Post.countDocuments(filter).exec()
    const totalPages = Math.ceil(totalPosts / 20)

    const skip = page ? (+page - 1) * 20 : 0
    const posts = await Post.find(filter).skip(skip).limit(20).lean().exec()
    const formatedPosts: (Omit<IPost, 'images' | 'userId'> & {
      id: string
      images: string[]
      userId: string
    })[] = []

    for (const post of posts) {
      formatedPosts.push({
        ...post,
        id: post._id.toString(),
        price: post.price / 100,
        userId: post.userId.toString(),
      })
    }

    res.status(200).send({ posts: formatedPosts, totalPages, totalPosts })
  } catch (e) {
    res.status(500).send({ message: err.INTERNAL_SERVER_ERROR })
  }
}

export default handler
