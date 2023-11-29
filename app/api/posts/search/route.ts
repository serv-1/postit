import Post from 'models/Post'
import { NextRequest, NextResponse } from 'next/server'
import searchPost from 'schemas/server/searchPost'
import type { Categories } from 'types'
import dbConnect from 'functions/dbConnect'
import validate from 'functions/validate'
import { INTERNAL_SERVER_ERROR } from 'constants/errors'

interface $Match {
  price?: { $gte?: number; $lte?: number }
  categories?: { $all: Categories[] }
}

interface SearchResult {
  posts: {
    id: string
    name: string
    price: number
    image: string
    address: string
  }[]
  totalPosts: { total: number }[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const result = validate(searchPost, {
    query: searchParams.get('query'),
    page: searchParams.get('page'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    categories: searchParams.getAll('categories'),
    address: searchParams.get('address'),
  })

  if ('message' in result) {
    return NextResponse.json({ message: result.message }, { status: 422 })
  }

  const { query, page, minPrice, maxPrice, categories, address } = result.value

  try {
    await dbConnect()

    const $search = address
      ? {
          compound: {
            must: [
              { text: { query, path: 'name' } },
              { text: { query: address, path: 'address' } },
            ],
          },
        }
      : { text: { query, path: 'name' } }

    const $match: $Match = {}

    if (minPrice && minPrice !== '0') {
      $match.price = { $gte: +minPrice * 100 }
    }

    if (maxPrice && maxPrice !== '0') {
      if ($match.price) {
        $match.price.$lte = +maxPrice * 100
      } else {
        $match.price = { $lte: +maxPrice * 100 }
      }
    }

    if (categories.length) {
      $match.categories = { $all: categories }
    }

    let $skip = 0

    if (page && page !== '0') {
      $skip = (+page - 1) * 20
    }

    const searchResult = await Post.aggregate<SearchResult>([
      { $search },
      { $match },
      {
        $facet: {
          posts: [
            { $sort: { name: 1, _id: 1 } },
            { $skip },
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

    const totalPosts = searchResult[0].totalPosts[0]?.total || 0

    return NextResponse.json(
      {
        posts: searchResult[0].posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / 20),
      },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
