import NextAuth, { type AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from 'libs/mongodb'
import User from 'models/User'
import dbConnect from 'functions/dbConnect'
import { GOOGLE_ID, GOOGLE_SECRET, SECRET } from 'env'
import { nanoid } from 'nanoid'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'

export const nextAuthOptions: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(NEXT_PUBLIC_VERCEL_URL + '/api/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        })

        if (!res.ok) return null

        return res.json()
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
  ],
  pages: { signIn: '/authentication' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id

        if (
          account.provider === 'google' &&
          user.image.startsWith('https://')
        ) {
          await dbConnect()

          token.channelName = nanoid()

          await User.updateOne(
            { _id: user.id },
            {
              image: '',
              postIds: [],
              favPostIds: [],
              discussions: [],
              hasUnseenMessages: false,
              channelName: token.channelName,
            }
          ).exec()
        } else {
          const { channelName } = (await User.findById(user.id).lean().exec())!

          token.channelName = channelName
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.id = token.id
        session.channelName = token.channelName
      }

      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: SECRET,
  adapter: MongoDBAdapter(clientPromise),
}

const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST }
