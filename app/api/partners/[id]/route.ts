import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
        analyses: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!partner) {
      return NextResponse.json(
        { error: "파트너사를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partner,
    })

  } catch (error: any) {
    console.error("Get partner error:", error)
    return NextResponse.json(
      { error: "파트너 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
