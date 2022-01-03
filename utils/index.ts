import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'
import { FORBIDDEN, PARAMS_INVALID } from './errors'

export async function authCheck(
  req: NextApiRequest,
  id?: string
): Promise<{ status: number; message: string } | void> {
  const session = await getSession({ req })
  if (!session) return { status: 403, message: FORBIDDEN }
  if (id && id !== session.user.id)
    return { status: 422, message: PARAMS_INVALID }
}
