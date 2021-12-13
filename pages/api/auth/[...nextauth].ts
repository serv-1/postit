import axios, { AxiosError } from 'axios'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { GOOGLE_ID, GOOGLE_SECRET, SECRET } from '../../../utils/env'
import { INTERNAL_SERVER_ERROR } from '../../../utils/errors'

type User = {
  username: string
  id: number
  email: string
}

export default NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post('http://localhost:3000/api/signIn', {
            username: credentials?.username,
            email: credentials?.email,
            password: credentials?.password,
          })
          console.log(res.data)
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
        switch (account.provider) {
          case 'credentials':
            token.user = user
            break
          case 'google':
            token.user = {
              id: user.id,
              username: user.name,
              email: user.email,
            }
            break
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as User
      }
      return session
    },
  },
  secret: SECRET,
})
