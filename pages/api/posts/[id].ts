import { isValidObjectId, UpdateQuery } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import Post, { PostModel } from '../../../models/Post'
import dbConnect from '../../../utils/functions/dbConnect'
import err from '../../../utils/constants/errors'
import validate from '../../../utils/functions/validate'
import csrfTokenSchema from '../../../schemas/csrfTokenSchema'
import isCsrfTokenValid from '../../../utils/functions/isCsrfTokenValid'
import updatePostApiSchema from '../../../schemas/updatePostApiSchema'
import getSessionAndUser from '../../../utils/functions/getSessionAndUser'
import catchError from '../../../utils/functions/catchError'
import env from '../../../utils/constants/env'
import deleteImage from '../../../utils/functions/deleteImage'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: err.PARAMS_INVALID })
  }

  if (!['GET', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ message: err.METHOD_NOT_ALLOWED })
  }

  if (req.method === 'GET') {
    await dbConnect()

    const post = await Post.findById(id).lean().exec()

    if (!post) {
      return res.status(404).json({ message: err.POST_NOT_FOUND })
    }

    return res.status(200).json({
      id: post._id.toString(),
      name: post.name,
      description: post.description,
      categories: post.categories,
      price: post.price / 100,
      images: post.images,
      address: post.address,
      latLon: post.latLon,
      discussionsIds: post.discussionsIds.map((i) => i.toString()),
      userId: post.userId.toString(),
    })
  }

  const { session, user } = await getSessionAndUser(req)
  if (!session || !user) {
    return res.status(401).json({ message: err.UNAUTHORIZED })
  }

  const result = validate<string>(csrfTokenSchema, req.body?.csrfToken)
  const csrfTokenCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME]

  if (!result.value || !isCsrfTokenValid(csrfTokenCookie, result.value)) {
    return res.status(422).json({ message: err.CSRF_TOKEN_INVALID })
  }

  const post = await Post.findById(id).lean().exec()
  if (!post) {
    return res.status(404).json({ message: err.POST_NOT_FOUND })
  }

  if (session.id !== post.userId.toString()) {
    return res.status(403).json({ message: err.FORBIDDEN })
  }

  if (req.method === 'PUT') {
    const result = validate(updatePostApiSchema, req.body)

    if ('message' in result) {
      return res.status(422).json({ message: result.message })
    }

    const reqBody = result.value
    const update: UpdateQuery<PostModel> = {}

    if (reqBody.images) {
      for (const image of post.images) {
        await deleteImage(image)
      }

      update.images = reqBody.images
    }
    if (reqBody.price) update.price = reqBody.price * 100
    if (reqBody.name) update.name = reqBody.name
    if (reqBody.description) update.description = reqBody.description
    if (reqBody.categories) update.categories = reqBody.categories
    if (reqBody.address) {
      update.address = reqBody.address
      update.latLon = reqBody.latLon
    }

    await dbConnect()
    await Post.updateOne({ _id: id }, update).exec()

    return res.status(204).end()
  }

  await dbConnect()
  await Post.deleteOne({ _id: id }).exec()

  res.status(204).end()
}

export default catchError(handler)
