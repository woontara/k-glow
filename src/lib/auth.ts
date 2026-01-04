import NextAuth, { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          throw new Error("존재하지 않는 사용자입니다")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다")
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
          companyName: user.companyName ?? undefined,
          image: user.image ?? undefined,
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // Kakao OAuth
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/welcome"
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyName = user.companyName
      }

      // OAuth sign in
      if (account?.provider && user) {
        // Update user with OAuth info if needed
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
          }
        })
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyName = token.companyName as string | undefined
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Allow all sign-ins for credentials
      if (account?.provider === "credentials") {
        return true
      }

      // For OAuth providers, create user if doesn't exist
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          // Create new user for OAuth
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "사용자",
              emailVerified: new Date(),
              image: user.image,
              role: "BRAND", // Default role
            }
          })
        }
      }

      return true
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`)
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },

  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
export const authOptions = authConfig // For backward compatibility
