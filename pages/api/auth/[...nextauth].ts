import axios, { AxiosError } from 'axios'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'
import User from '../../../models/User'
import dbConnect from '../../../utils/functions/dbConnect'
import env from '../../../utils/constants/env'
import err from '../../../utils/constants/errors'

export default NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(env.BASE_URL + '/api/signIn', {
            email: credentials?.email,
            password: credentials?.password,
          })
          return res.data
        } catch (e) {
          const res = (e as AxiosError).response
          if (!res) {
            throw new Error(err.NO_RESPONSE)
          }
          throw new Error(res.data.message || err.DEFAULT)
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
  pages: {
    signIn: '/auth/sign-in',
    verifyRequest: '/auth/mail-sent',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id

        if (account.provider === 'google' && user.image.includes('https://')) {
          await dbConnect()
          await User.updateOne(
            { _id: user.id },
            { emailVerified: new Date(), image: 'default.jpg', postsIds: [] }
          ).exec()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) session.id = token.id
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
})
