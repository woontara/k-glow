import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// Build providers list
const providers: NextAuthConfig["providers"] = [
  // Email/Password Authentication
  CredentialsProvider({
    id: "credentials",
    name: "이메일",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      console.log("[AUTH] Attempting login for:", credentials?.email)

      if (!credentials?.email || !credentials?.password) {
        console.log("[AUTH] Missing credentials")
        return null
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        console.log("[AUTH] User found:", !!user)

        if (!user || !user.password) {
          console.log("[AUTH] User not found or no password")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        console.log("[AUTH] Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        console.log("[AUTH] Login successful for:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyName: user.companyName ?? undefined,
          image: user.image ?? undefined,
        }
      } catch (error) {
        console.error("[AUTH] Error:", error)
        return null
      }
    }
  }),
]

// Add Google if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Add Kakao if configured (custom provider for better compatibility)
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push({
    id: "kakao",
    name: "Kakao",
    type: "oauth",
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: { scope: "profile_nickname profile_image account_email" },
    },
    token: "https://kauth.kakao.com/oauth/token",
    userinfo: "https://kapi.kakao.com/v2/user/me",
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    checks: ["state"],
    profile(profile: any) {
      return {
        id: String(profile.id),
        name: profile.kakao_account?.profile?.nickname,
        email: profile.kakao_account?.email,
        image: profile.kakao_account?.profile?.profile_image_url,
      }
    },
  })
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.companyName = (user as any).companyName
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
  },

  debug: true, // Enable for debugging
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
export const authOptions = authConfig
