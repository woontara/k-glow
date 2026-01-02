import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { scrapeWebsite } from "@/lib/scraper/website-scraper"
import { analyzePartner, translateProducts } from "@/lib/ai/analyzer"
import { z } from "zod"

const analyzeSchema = z.object({
  website: z.string().url("유효한 웹사이트 URL을 입력해주세요"),
})

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

    const body = await req.json()
    const { website } = analyzeSchema.parse(body)

    // 1. 웹사이트 크롤링
    console.log(`Scraping website: ${website}`)
    const scrapedData = await scrapeWebsite(website)

    // 2. 기존 파트너가 있는지 확인
    let partner = await prisma.partner.findUnique({
      where: { website },
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

    // 6. 제품 정보 번역 및 저장 (배치 처리)
    console.log(`Translating ${scrapedData.products.length} products...`)

    // 기존 제품 삭제
    await prisma.product.deleteMany({
      where: { partnerId: partner.id },
    })

    // 제품을 10개씩 묶어서 번역
    const batchSize = 10
    for (let i = 0; i < scrapedData.products.length; i += batchSize) {
      const batch = scrapedData.products.slice(i, i + batchSize)

      const translations = await translateProducts(
        batch.map(p => ({
          name: p.name,
          description: p.description,
        }))
      )

      // 번역된 제품들을 데이터베이스에 저장
      await prisma.product.createMany({
        data: batch.map((product, idx) => ({
          partnerId: partner!.id,
          name: product.name,
          nameKo: product.name,
          nameRu: translations[idx]?.nameRu,
          description: product.description,
          descriptionKo: product.description,
          descriptionRu: translations[idx]?.descriptionRu,
          price: product.price ? parseFloat(product.price.replace(/[^0-9.]/g, "")) : null,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          category: product.category,
        })),
      })
    }

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
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Partner analysis error:", error)
    return NextResponse.json(
      { error: error.message || "분석 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
