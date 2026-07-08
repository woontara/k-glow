// 클라이언트에 메시지를 그대로 노출해도 안전한 오류.
// 이 타입이 아닌 오류는 API 응답에서 일반 메시지로 대체된다.
export class PublicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PublicError"
  }
}
