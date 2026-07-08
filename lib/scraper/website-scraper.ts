import axios from "axios"
import * as cheerio from "cheerio"
import { lookup } from "node:dns/promises"
import net from "node:net"
import { PublicError } from "@/lib/errors"

export interface ScrapedProduct {
  name: string
  description?: string
  price?: string
  imageUrl?: string
  productUrl?: string
  category?: string
}

export interface ScrapedWebsite {
  url: string
  title: string
  description?: string
  products: ScrapedProduct[]
  logoUrl?: string
  metadata?: Record<string, any>
}

// 사설/내부망 IP 여부 판별 (SSRF 방어)
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number)
    return (
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8
      a === 127 || // 루프백
      (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 (CGNAT)
      (a === 169 && b === 254) || // 링크로컬 + 클라우드 메타데이터
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a >= 224 // 멀티캐스트/예약 대역
    )
  }
  const lower = ip.toLowerCase()
  if (lower === "::" || lower === "::1") return true
  if (lower.startsWith("fe80") || lower.startsWith("fc") || lower.startsWith("fd")) return true
  if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7))
  return false
}

// 호스트명 자체로 판별 가능한 내부 주소 차단 (동기 — 리다이렉트 검증에도 사용)
function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true
  }
  if (net.isIP(host)) return isPrivateIp(host)
  return false
}

// URL이 외부 공개 주소인지 검증. 내부망이면 PublicError를 던진다.
async function assertPublicUrl(url: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new PublicError("유효하지 않은 URL입니다")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new PublicError("http 또는 https URL만 분석할 수 있습니다")
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "")
  if (isBlockedHostname(host)) {
    throw new PublicError("내부 네트워크 주소는 분석할 수 없습니다")
  }

  if (!net.isIP(host)) {
    let addresses
    try {
      addresses = await lookup(host, { all: true })
    } catch {
      throw new PublicError("존재하지 않는 도메인입니다")
    }
    if (addresses.some((a) => isPrivateIp(a.address))) {
      throw new PublicError("내부 네트워크 주소는 분석할 수 없습니다")
    }
  }
}

// 상대 경로를 절대 URL로 변환. 잘못된 href나 http(s) 외 스킴(mailto:, javascript: 등)은 undefined 반환
function resolveUrl(href: string | undefined, base: string): string | undefined {
  if (!href) return undefined
  try {
    const resolved = new URL(href, base)
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return undefined
    }
    return resolved.href
  } catch {
    return undefined
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    // URL 정규화
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`

    // SSRF 방어: 내부망 주소 차단
    await assertPublicUrl(normalizedUrl)

    // 웹사이트 HTML 가져오기
    const response = await axios.get(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 30000,
      maxRedirects: 3,
      // 리다이렉트가 내부망 주소로 향하면 차단
      beforeRedirect: (options) => {
        if (isBlockedHostname(String(options.hostname ?? ""))) {
          throw new Error("Redirect to internal address blocked")
        }
      },
    })

    const html = response.data
    const $ = cheerio.load(html)

    // 기본 정보 추출
    const title = $("title").text().trim() ||
                  $('meta[property="og:title"]').attr("content") ||
                  $("h1").first().text().trim() ||
                  "Unknown"

    const description = $('meta[name="description"]').attr("content") ||
                        $('meta[property="og:description"]').attr("content") ||
                        $("p").first().text().trim()

    const logoUrl = $('meta[property="og:image"]').attr("content") ||
                    $('link[rel="icon"]').attr("href") ||
                    $('link[rel="apple-touch-icon"]').attr("href")

    // 제품 정보 추출 (다양한 패턴 시도)
    const products: ScrapedProduct[] = []

    // 일반적인 제품 컨테이너 선택자들
    const productSelectors = [
      ".product",
      ".product-item",
      ".item",
      '[class*="product"]',
      '[class*="item"]',
      "article",
    ]

    for (const selector of productSelectors) {
      const items = $(selector)

      if (items.length > 0 && items.length < 100) { // 너무 많은 요소는 제외
        items.each((_, element) => {
          const $el = $(element)

          const name = $el.find("h2, h3, h4, .product-name, [class*='name'], [class*='title']")
            .first()
            .text()
            .trim()

          if (!name) return // 이름이 없으면 스킵

          const description = $el.find("p, .description, [class*='desc']")
            .first()
            .text()
            .trim()
            .slice(0, 500)

          const price = $el.find(".price, [class*='price']")
            .first()
            .text()
            .trim()

          const imageUrl = $el.find("img")
            .first()
            .attr("src") ||
            $el.find("img")
            .first()
            .attr("data-src")

          const productLink = $el.find("a").first().attr("href")
          const productUrl = resolveUrl(productLink, normalizedUrl)

          const category = $el.find(".category, [class*='category']")
            .first()
            .text()
            .trim()

          if (name && products.length < 50) { // 최대 50개 제품
            products.push({
              name,
              description: description || undefined,
              price: price || undefined,
              imageUrl: resolveUrl(imageUrl, normalizedUrl),
              productUrl,
              category: category || undefined,
            })
          }
        })

        if (products.length > 0) break // 제품을 찾으면 다른 선택자 시도 안함
      }
    }

    // 제품을 찾지 못한 경우, 제품처럼 보이는 링크만 골라 추출
    if (products.length === 0) {
      const seenNames = new Set<string>()

      $("a").each((_, element) => {
        if (products.length >= 20) return false

        const $el = $(element)

        // 네비게이션/헤더/푸터 안의 링크는 제품이 아님
        if ($el.closest("nav, header, footer").length > 0) return

        const text = $el.text().trim()
        if (!text || text.length <= 3 || text.length >= 100) return
        if (seenNames.has(text)) return

        const img = $el.find("img").first()
        const productUrl = resolveUrl($el.attr("href"), normalizedUrl)
        const imageUrl = resolveUrl(img.attr("src") || img.attr("data-src"), normalizedUrl)

        // 이미지가 있거나 URL이 제품 페이지 패턴일 때만 제품으로 간주
        const looksLikeProduct =
          !!imageUrl ||
          (!!productUrl && /product|item|goods|shop/i.test(productUrl))
        if (!looksLikeProduct) return

        seenNames.add(text)
        products.push({
          name: text,
          productUrl,
          imageUrl,
        })
      })
    }

    return {
      url: normalizedUrl,
      title,
      description,
      products,
      logoUrl: resolveUrl(logoUrl, normalizedUrl),
      metadata: {
        scrapedAt: new Date().toISOString(),
        productCount: products.length,
      },
    }

  } catch (error: any) {
    console.error("Scraping error:", error.message)
    if (error instanceof PublicError) {
      throw error
    }
    throw new PublicError(
      "웹사이트를 가져올 수 없습니다. URL이 정확한지, 사이트가 접속 가능한지 확인해주세요"
    )
  }
}

// 여러 페이지를 크롤링하는 함수 (제품 리스트, 제품 상세 등)
export async function scrapeMultiplePages(
  urls: string[]
): Promise<ScrapedWebsite[]> {
  const results: ScrapedWebsite[] = []

  for (const url of urls) {
    try {
      const scraped = await scrapeWebsite(url)
      results.push(scraped)
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error)
    }
  }

  return results
}
