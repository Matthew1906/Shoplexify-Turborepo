import NextAuth from "next-auth"
import { DateTime } from "next-auth/providers/kakao"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    id: number
    name: string
    email: string
    role: string,
    dob: string
  }

  interface User {
    id: string;
    dob: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    dob: string;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    id: string;
    dob: string
  }
}
