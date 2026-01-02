import axios from "axios"
import * as cheerio from "cheerio"

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

export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    // URL 정규화
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`

    // 웹사이트 HTML 가져오기
    const response = await axios.get(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 30000,
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
          const productUrl = productLink
            ? new URL(productLink, normalizedUrl).href
            : undefined

          const category = $el.find(".category, [class*='category']")
            .first()
            .text()
            .trim()

          if (name && products.length < 50) { // 최대 50개 제품
            products.push({
              name,
              description: description || undefined,
              price: price || undefined,
              imageUrl: imageUrl ? new URL(imageUrl, normalizedUrl).href : undefined,
              productUrl,
              category: category || undefined,
            })
          }
        })

        if (products.length > 0) break // 제품을 찾으면 다른 선택자 시도 안함
      }
    }

    // 제품을 찾지 못한 경우, 페이지의 모든 링크와 이미지를 기반으로 추출
    if (products.length === 0) {
      $("a").each((_, element) => {
        const $el = $(element)
        const text = $el.text().trim()
        const href = $el.attr("href")
        const img = $el.find("img").first()

        if (text && text.length > 3 && text.length < 100 && products.length < 20) {
          products.push({
            name: text,
            productUrl: href ? new URL(href, normalizedUrl).href : undefined,
            imageUrl: img.attr("src")
              ? new URL(img.attr("src")!, normalizedUrl).href
              : undefined,
          })
        }
      })
    }

    return {
      url: normalizedUrl,
      title,
      description,
      products,
      logoUrl: logoUrl ? new URL(logoUrl, normalizedUrl).href : undefined,
      metadata: {
        scrapedAt: new Date().toISOString(),
        productCount: products.length,
      },
    }

  } catch (error: any) {
    console.error("Scraping error:", error.message)
    throw new Error(`Failed to scrape website: ${error.message}`)
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
