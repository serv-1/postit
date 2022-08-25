import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    image: string
  }

  interface Session {
    id: string
    channelName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    channelName: string
  }
}
