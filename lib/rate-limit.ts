// 인메모리 슬라이딩 윈도우 레이트 리미터.
// 단일 인스턴스 기준이며, 서버리스/멀티 인스턴스 환경에서는 인스턴스별로 카운트된다.
const buckets = new Map<string, number[]>()

const MAX_BUCKETS = 10_000

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const cutoff = now - windowMs

  // 버킷이 과도하게 쌓이면 만료된 것부터 정리
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, timestamps] of buckets) {
      if (timestamps.every((t) => t <= cutoff)) buckets.delete(k)
    }
  }

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps)
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((timestamps[0] + windowMs - now) / 1000)
    )
    return { allowed: false, retryAfterSeconds }
  }

  timestamps.push(now)
  buckets.set(key, timestamps)
  return { allowed: true, retryAfterSeconds: 0 }
}
