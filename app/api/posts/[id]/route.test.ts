/**
 * @jest-environment node
 */

import err from 'utils/constants/errors'
import { GET, PUT, DELETE } from './route'
// prettier-ignore
// @ts-expect-error
import { PostDoc, mockFindPostById, mockUpdateOnePost, mockDeleteOnePost } from 'models/Post'
// @ts-expect-error
import { mockGetServerSession } from 'next-auth'
// @ts-expect-error
import { mockDbConnect } from 'utils/functions/dbConnect'
// @ts-expect-error
import { mockDeleteImage } from 'utils/functions/deleteImage'
// @ts-expect-error
import { mockVerifyCsrfTokens } from 'utils/functions/verifyCsrfTokens'
import { Types } from 'mongoose'
import { NextRequest } from 'next/server'

jest
  .mock('models/Post')
  .mock('next-auth')
  .mock('utils/functions/dbConnect')
  .mock('utils/functions/deleteImage')
  .mock('utils/functions/verifyCsrfTokens')

describe('GET', () => {
  it('422 - invalid id', async () => {
    const request = new Request('http://-')
    const params = { params: { id: 'invalid id' } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.PARAMS_INVALID })
  })

  it('500 - database connection failed', async () => {
    mockDbConnect.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find post by id failed', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockRejectedValue({})

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('404 - post not found', async () => {
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(null)

    const request = new Request('http://-')
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: err.POST_NOT_FOUND })
  })

  it('200 - get the post', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }

    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)

    const request = new Request('http://-')
    const params = { params: { id: post._id.toString() } }
    const response = await GET(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 200)
    expect(data).toEqual({
      id: post._id.toString(),
      name: post.name,
      description: post.description,
      categories: post.categories,
      price: post.price / 100,
      images: post.images,
      address: post.address,
      latLon: post.latLon,
      discussionIds: post.discussionIds.map((id) => id.toString()),
      userId: post.userId.toString(),
    })
  })
})

describe('PUT', () => {
  it('422 - invalid id', async () => {
    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: 'invalid id' } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.PARAMS_INVALID })
  })

  it('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  it('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'PUT' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  it('422 - invalid request body', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({}),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toHaveProperty('message')
  })

  it('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'blue table',
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  it('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'blue table',
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find post by id failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'blue table',
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('404 - post not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(null)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'blue table',
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: err.POST_NOT_FOUND })
  })

  it('403 - forbidden', async () => {
    const session = { id: new Types.ObjectId().toString() }
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        name: 'blue table',
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: err.FORBIDDEN })
  })

  it('500 - deleting old images failed', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image1', 'image2'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        images: ['newImage1', 'newImage2'],
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('204 - images updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image1', 'image2'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newImages = ['newImage1', 'newImage2']
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', images: newImages }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockDeleteImage).toHaveBeenNthCalledWith(1, post.images[0])
    expect(mockDeleteImage).toHaveBeenNthCalledWith(2, post.images[1])
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { images: newImages }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('204 - price updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newPrice = 80
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', price: newPrice }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { price: newPrice * 100 }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('204 - name updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newName = 'blue table'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', name: newName }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { name: newName }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('204 - description updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newDescription = 'awesome table'
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', description: newDescription }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { description: newDescription }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('204 - categories updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newCategories = ['decoration', 'Do-It-Yourself']
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({ csrfToken: 'token', categories: newCategories }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { categories: newCategories }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })

  it('204 - address updated', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)
    mockDeleteImage.mockResolvedValue({})

    const newAddress = 'Oslo, Norway'
    const newLatLon = [11, 22]
    const request = new NextRequest('http://-', {
      method: 'PUT',
      body: JSON.stringify({
        csrfToken: 'token',
        address: newAddress,
        latLon: newLatLon,
      }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await PUT(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockUpdateOnePost).toHaveBeenNthCalledWith(
      1,
      { _id: params.params.id },
      { address: newAddress, latLon: newLatLon }
    )
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})

describe('DELETE', () => {
  it('422 - invalid id', async () => {
    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: 'invalid id' } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.PARAMS_INVALID })
  })

  it('401 - unauthorized', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 401)
    expect(data).toEqual({ message: err.UNAUTHORIZED })
  })

  it('422 - invalid json', async () => {
    mockGetServerSession.mockResolvedValue({})

    const request = new NextRequest('http://-', { method: 'DELETE' })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.DATA_INVALID })
  })

  it('422 - invalid csrf token', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(false)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({}),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 422)
    expect(data).toEqual({ message: err.CSRF_TOKEN_INVALID })
  })

  it('500 - database connection failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('500 - find post by id failed', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockRejectedValue({})

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response).toHaveProperty('status', 500)
    expect(data).toEqual({ message: err.INTERNAL_SERVER_ERROR })
  })

  it('404 - post not found', async () => {
    mockGetServerSession.mockResolvedValue({})
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(null)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 404)
    expect(data).toEqual({ message: err.POST_NOT_FOUND })
  })

  it('403 - forbidden', async () => {
    const session = { id: new Types.ObjectId().toString() }
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image1', 'image2'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)
    const data = await response.json()

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(response).toHaveProperty('status', 403)
    expect(data).toEqual({ message: err.FORBIDDEN })
  })

  it('204 - post deleted', async () => {
    const post: PostDoc = {
      _id: new Types.ObjectId(),
      name: 'table',
      description: 'Magnificent table',
      price: 4000,
      categories: ['furniture'],
      images: ['image1', 'image2'],
      address: 'Tokyo, Japan',
      latLon: [44, 33],
      discussionIds: [],
      userId: new Types.ObjectId(),
    }
    const session = { id: post.userId.toString() }

    mockGetServerSession.mockResolvedValue(session)
    mockVerifyCsrfTokens.mockReturnValue(true)
    mockDbConnect.mockResolvedValue({})
    mockFindPostById.mockResolvedValue(post)

    const request = new NextRequest('http://-', {
      method: 'DELETE',
      body: JSON.stringify({ csrfToken: 'token' }),
    })
    const params = { params: { id: new Types.ObjectId().toString() } }
    const response = await DELETE(request, params)

    expect(mockFindPostById).toHaveBeenNthCalledWith(1, params.params.id)
    expect(mockDeleteOnePost).toHaveBeenNthCalledWith(1, {
      _id: params.params.id,
    })
    expect(response).toHaveProperty('status', 204)
    expect(response.body).toBeNull()
  })
})
