import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    isVerified: boolean
    managerType: string | null
  }

  interface Session {
    user: {
      id: string
      role: string
      isVerified: boolean
      managerType: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isVerified: boolean
    managerType: string | null
  }
}