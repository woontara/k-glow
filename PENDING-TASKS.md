# K-Glow 대기중인 작업 목록

## 마켓플레이스 API 연동

### 쿠팡 (Coupang)
- [ ] 사업자 인증 완료 대기
- [ ] WING API 키 발급 (wing.coupang.com > 판매자정보 > 추가판매정보 > OPEN API 키 발급)
- [ ] Vercel 환경변수 설정:
  - `COUPANG_ACCESS_KEY`
  - `COUPANG_SECRET_KEY`
  - `COUPANG_VENDOR_ID`
- [ ] 대시보드 테스트 (https://k-glow.kr/admin/coupang)

### Wildberries
- [ ] 계정 생성 프로세스 완료 대기
- [ ] API 토큰 발급 (seller.wildberries.ru > 설정 > API 토큰)
- [ ] Vercel 환경변수 설정:
  - `WILDBERRIES_API_TOKEN`
- [ ] 대시보드 테스트 (https://k-glow.kr/admin/wildberries)

---

## 참고사항

### 쿠팡 API 키
- 유효기간: 180일 (6개월)
- 만료 14일 전 재발급 가능
- 발급 후 반영까지 1시간~최대 하루 소요

### Wildberries API 토큰
- FBS/FBW 동일 계정, 다른 풀필먼트 모델
- 토큰 카테고리별 권한 설정 가능

---

*마지막 업데이트: 2025-01-10*
