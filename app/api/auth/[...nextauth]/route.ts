import NextAuth from 'next-auth'
import { nextAuthOptions } from 'libs/nextAuth'

const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST }
