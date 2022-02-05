import NextAuth from 'next-auth'

interface SessionUser {
  id: string
  name: string
  email: string
}

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    image: string
  }

  interface Session {
    user: SessionUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: SessionUser
  }
}
