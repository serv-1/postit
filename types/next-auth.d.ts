import NextAuth from 'next-auth'

type SessionUser = Omit<User, 'image'>

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface User {
    id: number
    email: string
    name: string
    image:
      | string
      | {
          data: Buffer
          contentType: string
        }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: SessionUser
  }
}
