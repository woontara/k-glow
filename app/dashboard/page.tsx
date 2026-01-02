"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Partner {
  id: string
  name: string
  website: string
  brandRecognition: number | null
  products: any[]
  analyses: any[]
  _count: {
    products: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchPartners()
    }
  }, [status, router])

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners")
      const data = await res.json()

      if (data.success) {
        setPartners(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch partners:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAnalyzing(true)

    try {
      const res = await fetch("/api/partners/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website: websiteUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "분석에 실패했습니다")
      }

      setWebsiteUrl("")
      await fetchPartners() // 목록 새로고침
      alert("분석이 완료되었습니다!")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                K-Glow
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  대시보드
                </Link>
                <Link href="/dashboard/certifications" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  인증서 발급
                </Link>
                <Link href="/dashboard/quotes" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  견적 계산
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{session?.user?.name}님</span>
              <Link href="/api/auth/signout" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                로그아웃
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">파트너사 분석</h1>
          <p className="mt-2 text-gray-600">
            한국 화장품 브랜드 웹사이트를 분석하고 러시아 시장 잠재력을 평가합니다
          </p>
        </div>

        {/* Analyze Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">새 브랜드 분석</h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                브랜드 웹사이트 URL
              </label>
              <input
                type="url"
                id="website"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={analyzing}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {analyzing ? "분석 중... (최대 1-2분 소요)" : "분석 시작"}
            </button>
          </form>
        </div>

        {/* Partners List */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">분석된 파트너사</h2>
          {partners.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">아직 분석된 파트너사가 없습니다. 위에서 웹사이트를 분석해보세요!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{partner.name}</h3>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {partner.website}
                    </a>
                  </div>

                  {partner.brandRecognition !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">브랜드 인지도</span>
                        <span className="font-semibold">{partner.brandRecognition}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${partner.brandRecognition}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mb-4">
                    <p>제품 수: {partner._count.products}개</p>
                    <p>분석 횟수: {partner.analyses.length}회</p>
                  </div>

                  <Link
                    href={`/dashboard/partners/${partner.id}`}
                    className="block w-full text-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition font-medium"
                  >
                    상세 보기
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
