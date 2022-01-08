import NextAuth from 'next-auth'

type SessionUser = {
  id: string
  name: string
  email: string
}

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    image:
      | string
      | {
          data: Buffer
          contentType: string
        }
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
