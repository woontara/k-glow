import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    // 파트너 목록 조회
    const partners = await prisma.partner.findMany({
      include: {
        products: {
          take: 5, // 각 파트너의 제품 5개만 미리보기
        },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1, // 최신 분석 1개만
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: partners,
    })

  } catch (error: any) {
    console.error("Get partners error:", error)
    return NextResponse.json(
      { error: "파트너 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
