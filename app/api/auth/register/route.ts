import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal("")),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다" },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(validatedData.password, 12)

    // 회사 정보가 있으면 회사 먼저 생성
    let companyId: string | null = null
    if (validatedData.companyName) {
      const company = await prisma.company.create({
        data: {
          name: validatedData.companyName,
          nameKo: validatedData.companyName,
          website: validatedData.companyWebsite || null,
        }
      })
      companyId = company.id
    }

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        companyId,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
      }
    })

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다",
        user
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
