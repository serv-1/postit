/**
 * @jest-environment node
 */

import { GET } from './route'
import { NextRequest } from 'next/server'
import err from 'utils/constants/errors'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockAggregate } from 'models/Post'

jest.mock('models/Post').mock('utils/functions/dbConnect')

describe('GET', () => {
  test('422 - invalid search params', async () => {
    const request = new NextRequest('http://-')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('message')
  })

  test('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-?query=cat')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('500 - post aggregation failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockRejectedValue({})

    const request = new NextRequest('http://-?query=cat')
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  test('posts searched by query', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({ query: 'cat' })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][0]).toHaveProperty('$search', {
      text: { query: searchParams.get('query'), path: 'name' },
    })
  })

  test('posts searched by query and address', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      address: 'Tokyo, Japan',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][0]).toHaveProperty('$search', {
      compound: {
        must: [
          { text: { query: searchParams.get('query'), path: 'name' } },
          { text: { query: searchParams.get('address'), path: 'address' } },
        ],
      },
    })
  })

  test('posts searched by query and minPrice', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      minPrice: '10',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][1]).toHaveProperty('$match', {
      price: {
        $gte: 1000,
      },
    })
  })

  test('minPrice is ignored if its value is 0', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      minPrice: '0',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][1]).not.toHaveProperty('$match.price')
  })

  test('posts searched by query and maxPrice', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      maxPrice: '40',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][1]).toHaveProperty('$match', {
      price: {
        $lte: 4000,
      },
    })
  })

  test('maxPrice is ignored if its value is 0', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      maxPrice: '0',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][1]).not.toHaveProperty('$match.price')
  })

  test('posts searched by query and categories', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams([
      ['query', 'cat'],
      ['categories', 'animal'],
      ['categories', 'toy'],
    ])
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][1]).toHaveProperty('$match', {
      categories: { $all: ['animal', 'toy'] },
    })
  })

  test('posts searched by page', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      page: '2',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][2].$facet.posts[1]).toHaveProperty(
      '$skip',
      20
    )
  })

  test('page is ignored if its value is 0', async () => {
    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue([])

    const searchParams = new URLSearchParams({
      query: 'cat',
      page: '0',
    })
    const request = new NextRequest('http://-?' + searchParams.toString())
    await GET(request)

    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate.mock.calls[0][0][2].$facet.posts[1]).toHaveProperty(
      '$skip',
      0
    )
  })

  test('200 - posts found', async () => {
    const searchResult = [
      {
        posts: [{ name: 'blue cat' }, { name: 'red cat' }],
        totalPosts: [{ total: 2 }],
      },
    ]

    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue(searchResult)

    const searchParams = new URLSearchParams({ query: 'cat' })
    const request = new NextRequest('http://-?' + searchParams.toString())
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      posts: searchResult[0].posts,
      totalPosts: searchResult[0].totalPosts[0].total,
      totalPages: 1,
    })
  })

  test('200 - no posts found', async () => {
    const searchResult = [{ posts: [], totalPosts: [] }]

    mockDbConnect.mockResolvedValue({})
    mockAggregate.mockResolvedValue(searchResult)

    const searchParams = new URLSearchParams({ query: 'cat' })
    const request = new NextRequest('http://-?' + searchParams.toString())
    const response = await GET(request)
    const data = await response.json()

    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      posts: searchResult[0].posts,
      totalPosts: 0,
      totalPages: 0,
    })
  })
})
