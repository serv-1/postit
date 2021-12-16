import axios, { AxiosError } from 'axios'
import NextAuth, { User as U } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import User from '../../../models/User'
import dbConnect from '../../../utils/dbConnect'
import { GOOGLE_ID, GOOGLE_SECRET, SECRET } from '../../../utils/env'
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
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signIn',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.user = user

        if (account.provider === 'google') {
          await dbConnect()

          const isRegistered = await User.findOne({ email: user.email }).exec()

          if (!isRegistered) {
            const u = new User(user)
            await u.save()
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as U
      }
      return session
    },
  },
  secret: SECRET,
})
