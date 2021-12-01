import axios, { AxiosError } from 'axios'
import NextAuth, { User } from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
  providers: [
    Providers.Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post('http://localhost:3000/api/login', {
            email: credentials.email,
            password: credentials.password,
          })
          return res.data
        } catch (e) {
          const err = e as AxiosError
          if (err.response) {
            throw new Error(err.response.data.message)
          }
          throw new Error(
            'An unknown error occured. Try to refresh the page and log in again.'
          )
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/credentials-login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id
        token.user = user
      }
      return token
    },
    async session(session, token) {
      if (token) {
        session.accessToken = token.id
        session.user = token.user as User
      }
      return session
    },
  },
})
