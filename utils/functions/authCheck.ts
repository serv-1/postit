import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'
import err from '../constants/errors'
import { createHash } from 'crypto'
import env from '../constants/env'

const authCheck = async (
  req: NextApiRequest,
  id?: string
): Promise<{ status: number; message: string } | void> => {
  const session = await getSession({ req })

  if (!session) {
    return { status: 403, message: err.FORBIDDEN }
  }

  const hash = req.cookies['next-auth.csrf-token'].split('|')[1]
  const expectedHash = createHash('sha256')
    .update(`${req.body.csrfToken}${env.SECRET}`)
    .digest('hex')

  if (expectedHash !== hash) {
    return { status: 422, message: err.DATA_INVALID }
  }

  if (id && id !== session.id) {
    return { status: 422, message: err.PARAMS_INVALID }
  }
}

export default authCheck
