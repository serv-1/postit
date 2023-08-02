import NextAuth, { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from 'libs/mongodb'
import User, { UserDoc } from 'models/User'
import dbConnect from 'utils/functions/dbConnect'
import env from 'utils/constants/env'
import { nanoid } from 'nanoid'

export const nextAuthOptions: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const res = await fetch(env.VERCEL_URL + '/api/sign-in', {
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
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT),
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      },
      from: env.EMAIL_FROM,
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
  secret: env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
}

const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST }
