import OpenAI from "openai"
import { ScrapedWebsite } from "../scraper/website-scraper"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AnalysisResult {
  summary: string
  summaryRu: string
  brandStrength: number // 0-100
  marketPotential: number // 0-100
  competitiveness: number // 0-100
  brandRecognition: number // 0-100
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  recommendations: string
  recommendationsRu: string
}

export async function analyzePartner(
  scrapedData: ScrapedWebsite
): Promise<AnalysisResult> {
  try {
    const prompt = `
당신은 한국 화장품 브랜드를 러시아/CIS 시장에 진출시키는 전문가입니다.
다음 웹사이트 정보를 분석하고, 러시아 시장에서의 잠재력을 평가해주세요.

웹사이트 정보:
- URL: ${scrapedData.url}
- 제목: ${scrapedData.title}
- 설명: ${scrapedData.description || "없음"}
- 제품 수: ${scrapedData.products.length}
- 제품 샘플:
${scrapedData.products.slice(0, 10).map((p, i) => `  ${i + 1}. ${p.name} ${p.price ? `(${p.price})` : ""}`).join("\n")}

다음 항목들을 JSON 형식으로 평가해주세요:
1. brandStrength (브랜드 강점, 0-100점)
2. marketPotential (시장 잠재력, 0-100점)
3. competitiveness (경쟁력, 0-100점)
4. brandRecognition (브랜드 인지도 추정, 0-100점)
5. strengths (강점 3-5개, 배열)
6. weaknesses (약점 2-3개, 배열)
7. opportunities (기회 요인 2-3개, 배열)
8. summary (종합 평가, 한국어 2-3문장)
9. recommendations (추천사항, 한국어 3-4문장)

JSON 형식으로만 응답해주세요.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a cosmetics market analyst specializing in Korean-Russian trade. Respond only in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const analysisData = JSON.parse(completion.choices[0].message.content || "{}")

    // 러시아어 번역
    const translationPrompt = `
다음 텍스트를 러시아어로 번역해주세요:

Summary: ${analysisData.summary}
Recommendations: ${analysisData.recommendations}

JSON 형식으로 응답해주세요:
{
  "summaryRu": "러시아어 번역",
  "recommendationsRu": "러시아어 번역"
}
`

    const translationCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional Korean-Russian translator. Respond only in valid JSON format.",
        },
        {
          role: "user",
          content: translationPrompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const translations = JSON.parse(translationCompletion.choices[0].message.content || "{}")

    return {
      summary: analysisData.summary || "분석 정보가 부족합니다",
      summaryRu: translations.summaryRu || analysisData.summary,
      brandStrength: analysisData.brandStrength || 50,
      marketPotential: analysisData.marketPotential || 50,
      competitiveness: analysisData.competitiveness || 50,
      brandRecognition: analysisData.brandRecognition || 50,
      strengths: analysisData.strengths || [],
      weaknesses: analysisData.weaknesses || [],
      opportunities: analysisData.opportunities || [],
      recommendations: analysisData.recommendations || "추가 정보가 필요합니다",
      recommendationsRu: translations.recommendationsRu || analysisData.recommendations,
    }

  } catch (error: any) {
    console.error("AI analysis error:", error.message)
    throw new Error(`Failed to analyze partner: ${error.message}`)
  }
}

// 개별 제품 정보를 러시아어로 번역
export async function translateProduct(
  name: string,
  description?: string
): Promise<{ nameRu: string; descriptionRu?: string }> {
  try {
    const prompt = `
다음 제품 정보를 러시아어로 번역해주세요:

제품명: ${name}
${description ? `설명: ${description}` : ""}

JSON 형식으로 응답해주세요:
{
  "nameRu": "러시아어 제품명",
  ${description ? '"descriptionRu": "러시아어 설명"' : ""}
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional Korean-Russian translator for cosmetics products. Respond only in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const translation = JSON.parse(completion.choices[0].message.content || "{}")

    return {
      nameRu: translation.nameRu || name,
      descriptionRu: translation.descriptionRu,
    }

  } catch (error: any) {
    console.error("Translation error:", error.message)
    return {
      nameRu: name,
      descriptionRu: description,
    }
  }
}

// 여러 제품을 한번에 번역 (효율성을 위해)
export async function translateProducts(
  products: Array<{ name: string; description?: string }>
): Promise<Array<{ nameRu: string; descriptionRu?: string }>> {
  try {
    const prompt = `
다음 제품들의 이름과 설명을 러시아어로 번역해주세요:

${products.map((p, i) => `
${i + 1}. 제품명: ${p.name}
   ${p.description ? `설명: ${p.description}` : ""}
`).join("\n")}

JSON 배열 형식으로 응답해주세요:
[
  {
    "nameRu": "러시아어 제품명",
    "descriptionRu": "러시아어 설명"
  },
  ...
]
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional Korean-Russian translator for cosmetics products. Respond only in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const response = JSON.parse(completion.choices[0].message.content || '{"translations": []}')
    const translations = response.translations || []

    return translations.map((t: any, i: number) => ({
      nameRu: t.nameRu || products[i].name,
      descriptionRu: t.descriptionRu || products[i].description,
    }))

  } catch (error: any) {
    console.error("Batch translation error:", error.message)
    // 오류 시 원본 반환
    return products.map(p => ({
      nameRu: p.name,
      descriptionRu: p.description,
    }))
  }
}
