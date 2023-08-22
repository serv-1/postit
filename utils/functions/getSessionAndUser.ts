import { NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'
import User from 'models/User'

/**
 * Return the session and the signed in user or nothing if one is undefined.
 */
const getSessionAndUser = async (req: NextApiRequest) => {
  const session = await getSession({ req })

  if (!session) return { session, user: null }

  const user = await User.findById(session.id).lean().exec()

  if (!user) return { session, user: null }

  return { session, user }
}

export default getSessionAndUser
