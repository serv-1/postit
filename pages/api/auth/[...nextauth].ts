import axios from 'axios'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '../../../libs/mongodb'
import User, { UserModel } from '../../../models/User'
import dbConnect from '../../../utils/functions/dbConnect'
import env from '../../../utils/constants/env'
import getAxiosError from '../../../utils/functions/getAxiosError'
import { nanoid } from 'nanoid'

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL

export default NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(baseUrl + '/api/signIn', {
            email: credentials?.email,
            password: credentials?.password,
          })

          return res.data
        } catch (e) {
          throw new Error(JSON.stringify(getAxiosError(e)))
        }
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
        let channelName: string = ''

        if (account.provider === 'google' && user.image.includes('https://')) {
          await dbConnect()

          channelName = nanoid()

          await User.updateOne(
            { _id: user.id },
            {
              postsIds: [],
              favPostsIds: [],
              discussionsIds: [],
              hasUnseenMessages: false,
              channelName,
            }
          ).exec()
        } else {
          const u = (await User.findById(user.id).lean().exec()) as UserModel
          channelName = u.channelName
        }

        token.channelName = channelName
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
})
