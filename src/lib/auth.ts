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
    token: {
      url: "https://kauth.kakao.com/oauth/token",
      async request({ params, provider }: { params: Record<string, unknown>; provider: { clientId?: string; clientSecret?: string; callbackUrl?: string } }) {
        const redirectUri = (params.redirect_uri as string) || provider.callbackUrl || "https://k-glow.kr/api/auth/callback/kakao"
        console.log("[KAKAO TOKEN] Request params:", { code: params.code, redirect_uri: redirectUri })
        const response = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: provider.clientId as string,
            client_secret: provider.clientSecret as string,
            redirect_uri: redirectUri,
            code: params.code as string,
          }),
        })
        const tokens = await response.json()
        console.log("[KAKAO TOKEN] Response:", JSON.stringify(tokens))
        return { tokens }
      },
    },
    userinfo: "https://kapi.kakao.com/v2/user/me",
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    checks: ["state"],
    profile(profile: any) {
      return {
        id: String(profile.id),
        name: profile.kakao_account?.profile?.nickname,
        email: profile.kakao_account?.email,
        image: profile.kakao_account?.profile?.profile_image_url,
      }
    },
  } as any)
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
    async signIn({ user, account }) {
      // OAuth 로그인 시 같은 이메일의 기존 계정과 연결
      if (account?.provider !== "credentials" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (existingUser) {
            // 기존 계정이 있으면 해당 계정 정보 사용
            console.log("[AUTH] Found existing user for OAuth:", existingUser.email)
            user.id = existingUser.id
            ;(user as any).role = existingUser.role
            ;(user as any).companyName = existingUser.companyName
          } else {
            // 새 사용자 생성
            console.log("[AUTH] Creating new user from OAuth:", user.email)
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "사용자",
                image: user.image,
                role: UserRole.BUYER,
              }
            })
            user.id = newUser.id
            ;(user as any).role = newUser.role
            ;(user as any).companyName = newUser.companyName
          }
        } catch (error) {
          console.error("[AUTH] OAuth signIn error:", error)
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.companyName = (user as any).companyName
      }

      // OAuth 로그인 시 DB에서 최신 사용자 정보 가져오기
      if (account?.provider !== "credentials" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.companyName = dbUser.companyName
          }
        } catch (error) {
          console.error("[AUTH] JWT callback error:", error)
        }
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
