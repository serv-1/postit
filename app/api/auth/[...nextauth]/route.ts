import NextAuth, { type AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from 'libs/mongodb'
import User, { type UserDoc } from 'models/User'
import dbConnect from 'utils/functions/dbConnect'
import {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER,
  GOOGLE_ID,
  GOOGLE_SECRET,
  SECRET,
} from 'env'
import { nanoid } from 'nanoid'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'

export const nextAuthOptions: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
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
    EmailProvider({
      server: {
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      },
      from: EMAIL_FROM,
      maxAge: 3600,
    }),
  ],
  pages: { signIn: '/authentication', verifyRequest: '/mail-sent' },
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
              postsIds: [],
              favPostsIds: [],
              discussionsIds: [],
              hasUnseenMessages: false,
              channelName: token.channelName,
            }
          ).exec()
        } else {
          const { channelName } = (await User.findById(user.id)
            .lean()
            .exec()) as UserDoc

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
