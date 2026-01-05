import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름을 입력해주세요"),
  companyName: z.string().optional(),
  role: z.enum(["BRAND", "BUYER"]).default("BRAND"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        companyName: validatedData.companyName,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
      }
    })

    return NextResponse.json({
      message: '회원가입이 완료되었습니다',
      user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('회원가입 실패:', error)
    return NextResponse.json(
      { error: '회원가입에 실패했습니다', details: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
