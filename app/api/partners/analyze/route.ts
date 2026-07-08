import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { scrapeWebsite } from "@/lib/scraper/website-scraper"
import { analyzePartner, translateProducts } from "@/lib/ai/analyzer"
import { PublicError } from "@/lib/errors"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

// 크롤링 + AI 분석 + 번역으로 1~2분 걸리므로 Vercel 함수 실행 한도를 늘린다.
// (Fluid compute 미사용 Hobby 플랜은 최대 60까지만 허용 — 배포 오류 시 60으로 낮출 것)
export const maxDuration = 300

// 사용자당 시간당 분석 요청 한도 (OpenAI 비용 남용 방지)
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

const analyzeSchema = z.object({
  website: z.string().url("유효한 웹사이트 URL을 입력해주세요"),
})

// "12,000원", "₩12000" 등에서 숫자만 추출, 숫자가 없으면 null
function parsePrice(price?: string): number | null {
  if (!price) return null
  const value = parseFloat(price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? value : null
}

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    // 레이트 리밋 확인
    const rate = checkRateLimit(
      `analyze:${session.user.id}`,
      RATE_LIMIT,
      RATE_WINDOW_MS
    )
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `요청이 너무 많습니다. ${Math.ceil(rate.retryAfterSeconds / 60)}분 후에 다시 시도해주세요`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        }
      )
    }

    const body = await req.json()
    const { website } = analyzeSchema.parse(body)

    // 1. 웹사이트 크롤링
    console.log(`Scraping website: ${website}`)
    const scrapedData = await scrapeWebsite(website)

    // 2. 이 사용자가 이미 분석한 파트너인지 확인
    let partner = await prisma.partner.findUnique({
      where: {
        createdById_website: {
          createdById: session.user.id,
          website,
        },
      },
    })

    // 3. AI 분석 수행
    console.log("Analyzing with AI...")
    const analysis = await analyzePartner(scrapedData)

    // 4. 파트너 정보 저장 또는 업데이트
    if (partner) {
      partner = await prisma.partner.update({
        where: { id: partner.id },
        data: {
          name: scrapedData.title,
          description: scrapedData.description,
          logoUrl: scrapedData.logoUrl,
          brandRecognition: analysis.brandRecognition,
          analysisData: scrapedData as any,
          lastCrawledAt: new Date(),
        },
      })
    } else {
      partner = await prisma.partner.create({
        data: {
          createdById: session.user.id,
          name: scrapedData.title,
          website,
          description: scrapedData.description,
          logoUrl: scrapedData.logoUrl,
          brandRecognition: analysis.brandRecognition,
          analysisData: scrapedData as any,
          lastCrawledAt: new Date(),
        },
      })
    }

    // 5. AI 분석 결과 저장
    const savedAnalysis = await prisma.analysis.create({
      data: {
        partnerId: partner.id,
        summary: analysis.summary,
        summaryRu: analysis.summaryRu,
        brandStrength: analysis.brandStrength,
        marketPotential: analysis.marketPotential,
        competitiveness: analysis.competitiveness,
        strengths: analysis.strengths as any,
        weaknesses: analysis.weaknesses as any,
        opportunities: analysis.opportunities as any,
        recommendations: analysis.recommendations,
        recommendationsRu: analysis.recommendationsRu,
        rawData: analysis as any,
      },
    })

    // 6. 제품 정보 번역 (배치 처리) — 번역을 모두 마친 뒤에 저장
    console.log(`Translating ${scrapedData.products.length} products...`)

    const batchSize = 10
    const productRows: {
      partnerId: string
      name: string
      nameKo: string
      nameRu: string | null
      description: string | null
      descriptionKo: string | null
      descriptionRu: string | null
      price: number | null
      imageUrl: string | null
      productUrl: string | null
      category: string | null
    }[] = []

    for (let i = 0; i < scrapedData.products.length; i += batchSize) {
      const batch = scrapedData.products.slice(i, i + batchSize)

      const translations = await translateProducts(
        batch.map(p => ({
          name: p.name,
          description: p.description,
        }))
      )

      batch.forEach((product, idx) => {
        productRows.push({
          partnerId: partner!.id,
          name: product.name,
          nameKo: product.name,
          nameRu: translations[idx]?.nameRu ?? null,
          description: product.description ?? null,
          descriptionKo: product.description ?? null,
          descriptionRu: translations[idx]?.descriptionRu ?? null,
          price: parsePrice(product.price),
          imageUrl: product.imageUrl ?? null,
          productUrl: product.productUrl ?? null,
          category: product.category ?? null,
        })
      })
    }

    // 기존 제품 삭제 + 새 제품 저장을 하나의 트랜잭션으로 처리
    await prisma.$transaction([
      prisma.product.deleteMany({
        where: { partnerId: partner.id },
      }),
      prisma.product.createMany({
        data: productRows,
      }),
    ])

    // 7. 전체 결과 반환
    const result = await prisma.partner.findUnique({
      where: { id: partner.id },
      include: {
        products: {
          take: 20,
        },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "분석이 완료되었습니다",
      data: result,
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    // 사용자에게 보여줘도 되는 오류만 메시지 그대로 반환
    if (error instanceof PublicError) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }

    // 그 외 내부 오류는 상세 내용을 노출하지 않음
    console.error("Partner analysis error:", error)
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요" },
      { status: 500 }
    )
  }
}
