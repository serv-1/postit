import { NextApiRequest, NextApiResponse } from 'next'
import err from '../constants/errors'

const catchError = (
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return handler(req, res)
    } catch (e) {
      return res.status(500).json({ message: err.INTERNAL_SERVER_ERROR })
    }
  }
}

export default catchError
