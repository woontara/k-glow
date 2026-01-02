"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Product {
  id: string
  name: string
  nameRu: string | null
  description: string | null
  descriptionRu: string | null
  price: number | null
  imageUrl: string | null
  productUrl: string | null
}

interface Analysis {
  id: string
  summary: string | null
  summaryRu: string | null
  brandStrength: number | null
  marketPotential: number | null
  competitiveness: number | null
  strengths: string[] | any
  weaknesses: string[] | any
  opportunities: string[] | any
  recommendations: string | null
  recommendationsRu: string | null
  createdAt: string
}

interface Partner {
  id: string
  name: string
  website: string
  description: string | null
  brandRecognition: number | null
  products: Product[]
  analyses: Analysis[]
}

export default function PartnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRussian, setShowRussian] = useState(false)

  useEffect(() => {
    fetchPartner()
  }, [params.id])

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/partners/${params.id}`)
      if (res.status === 401) {
        router.push("/auth/signin")
        return
      }

      const data = await res.json()
      if (data.success) {
        setPartner(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch partner:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">파트너사를 찾을 수 없습니다</div>
      </div>
    )
  }

  const latestAnalysis = partner.analyses[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
                K-Glow
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                ← 대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {partner.website}
              </a>
              {partner.description && (
                <p className="mt-2 text-gray-600">{partner.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowRussian(!showRussian)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
            >
              {showRussian ? "한국어" : "Русский"}
            </button>
          </div>

          {partner.brandRecognition !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">브랜드 인지도</span>
                <span className="font-semibold">{partner.brandRecognition}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${partner.brandRecognition}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {latestAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI 분석 결과</h2>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">요약</h3>
              <p className="text-gray-700">
                {showRussian && latestAnalysis.summaryRu
                  ? latestAnalysis.summaryRu
                  : latestAnalysis.summary}
              </p>
            </div>

            {/* Scores */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {latestAnalysis.brandStrength !== null && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">브랜드 강점</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {latestAnalysis.brandStrength}/100
                  </div>
                </div>
              )}
              {latestAnalysis.marketPotential !== null && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">시장 잠재력</div>
                  <div className="text-2xl font-bold text-green-700">
                    {latestAnalysis.marketPotential}/100
                  </div>
                </div>
              )}
              {latestAnalysis.competitiveness !== null && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">경쟁력</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {latestAnalysis.competitiveness}/100
                  </div>
                </div>
              )}
            </div>

            {/* SWOT Analysis */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {latestAnalysis.strengths && Array.isArray(latestAnalysis.strengths) && latestAnalysis.strengths.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">강점</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {latestAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {latestAnalysis.weaknesses && Array.isArray(latestAnalysis.weaknesses) && latestAnalysis.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">약점</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {latestAnalysis.weaknesses.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {latestAnalysis.opportunities && Array.isArray(latestAnalysis.opportunities) && latestAnalysis.opportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">기회</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {latestAnalysis.opportunities.map((o: string, i: number) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {latestAnalysis.recommendations && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">추천사항</h3>
                <p className="text-gray-700">
                  {showRussian && latestAnalysis.recommendationsRu
                    ? latestAnalysis.recommendationsRu
                    : latestAnalysis.recommendations}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제품 목록 ({partner.products.length}개)
          </h2>
          {partner.products.length === 0 ? (
            <p className="text-gray-500">제품 정보가 없습니다</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {partner.products.slice(0, 30).map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {showRussian && product.nameRu ? product.nameRu : product.name}
                  </h3>
                  {(product.description || product.descriptionRu) && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {showRussian && product.descriptionRu
                        ? product.descriptionRu
                        : product.description}
                    </p>
                  )}
                  {product.price && (
                    <p className="text-sm font-semibold text-indigo-600">
                      ₩{product.price.toLocaleString()}
                    </p>
                  )}
                  {product.productUrl && (
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline mt-2 block"
                    >
                      제품 페이지 →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
