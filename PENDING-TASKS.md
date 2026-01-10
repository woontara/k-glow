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

### OZON (러시아)
- [ ] OZON 셀러 계정 생성
- [ ] API 키 발급 (seller.ozon.ru > Settings > API keys)
- [ ] Vercel 환경변수 설정:
  - `OZON_CLIENT_ID`
  - `OZON_API_KEY`
- [ ] 대시보드 테스트 (https://k-glow.kr/admin/ozon)

### Wildberries (러시아)
- [ ] 계정 생성 프로세스 완료 대기
- [ ] API 토큰 발급 (seller.wildberries.ru > 설정 > API 토큰)
- [ ] Vercel 환경변수 설정:
  - `WILDBERRIES_API_TOKEN`
- [ ] 대시보드 테스트 (https://k-glow.kr/admin/wildberries)

---

## 브랜드 고객사 설정 (API 연동 후)

### 1. 상품 등록 시 SKU 규칙
마켓플레이스에 상품 등록 시 SKU에 브랜드 접두사 사용:
```
{브랜드코드}-{상품코드}
예: BRAND1-001, ABC-SKU123
```

### 2. 브랜드 등록 (관리자)
API: `POST /api/admin/brands`
```json
{
  "name": "Brand Name (영문)",
  "nameKo": "브랜드명 (한글)",
  "skuPrefix": "BRAND1",
  "contactEmail": "brand@example.com"
}
```

### 3. 브랜드 사용자 계정 생성
1. 사용자 계정 생성 (role: BRAND)
2. 해당 사용자에 brandId 연결
3. 사용자가 로그인하면 자기 브랜드 데이터만 조회됨

### 4. 데이터 필터링 방식
- **관리자 (ADMIN)**: 모든 데이터 조회
- **브랜드 사용자 (BRAND)**: SKU 접두사 매칭 데이터만 조회
  - 상품: vendorCode/offer_id/externalVendorSku가 접두사로 시작
  - 판매/주문: 해당 상품이 포함된 건만

---

## 향후 연동 고려 대상

### Gold Apple (Золотое Яблоко)
- 러시아 1위 뷰티 전문몰
- 파트너 포털: https://seller.goldapple.ru/
- API 문서는 파트너 등록 후 확인 필요

### Л'Этуаль (Letu.ru)
- 러시아 뷰티 시장 60% 점유
- 파트너 포털: https://marketplace.letu.ru
- API 정보 미공개, 파트너 문의 필요

### Yandex Market
- 러시아 종합몰
- API 문서: https://yandex.ru/dev/market/partner-api/doc/ru/
- 뷰티 카테고리 지원

---

## 참고사항

### 쿠팡 API 키
- 유효기간: 180일 (6개월)
- 만료 14일 전 재발급 가능
- 발급 후 반영까지 1시간~최대 하루 소요

### OZON API
- Client-Id + Api-Key 인증 방식
- 공식 문서: https://docs.ozon.ru/api/seller/
- Python/PHP/Go SDK 제공

### Wildberries API 토큰
- FBS/FBW 동일 계정, 다른 풀필먼트 모델
- 토큰 카테고리별 권한 설정 가능

---

*마지막 업데이트: 2025-01-10*
