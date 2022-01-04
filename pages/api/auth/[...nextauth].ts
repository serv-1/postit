import axios, { AxiosError } from 'axios'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'
import User, { defaultImage } from '../../../models/User'
import dbConnect from '../../../utils/dbConnect'
import env from '../../../utils/env'
import { INTERNAL_SERVER_ERROR } from '../../../utils/errors'

export default NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post('http://localhost:3000/api/signIn', {
            email: credentials?.email,
            password: credentials?.password,
          })
          return res.data
        } catch (e) {
          const err = e as AxiosError
          if (err.response) {
            throw new Error(err.response.data.message)
          }
          throw new Error(INTERNAL_SERVER_ERROR)
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
    verifyRequest: '/auth/email-sent',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
        }

        if (account.provider === 'google' && typeof user.image === 'string') {
          await dbConnect()
          await User.updateOne(
            { _id: user.id },
            { emailVerified: new Date(), image: defaultImage }
          ).exec()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
})
