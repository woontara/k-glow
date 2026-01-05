import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 테스트 모드: 모든 인증 체크 비활성화
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}
