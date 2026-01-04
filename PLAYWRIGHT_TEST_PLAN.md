# K-Glow 웹사이트 Playwright 테스트 계획서

## 프로젝트 개요

**프로젝트명**: K-Glow (한국 화장품 러시아 수출 플랫폼)
**테스트 대상 URL**: http://localhost:3003
**테스트 프레임워크**: Playwright
**작성일**: 2026-01-03

## 주요 테스트 영역

### 📋 테스트 스위트 구성

1. **네비게이션 및 공통 UI** (5개 시나리오)
2. **홈페이지** (3개 시나리오)
3. **인증 및 사용자 관리** (10개 시나리오)
4. **파트너사 관리** (5개 시나리오)
5. **견적 계산기** (9개 시나리오)
6. **브랜드 분석** (6개 시나리오)
7. **인증 대행** (13개 시나리오)
8. **관리자 기능** (3개 시나리오)
9. **반응형 및 크로스 브라우저** (5개 시나리오)
10. **성능 및 접근성** (5개 시나리오)
11. **Edge Cases 및 보안** (4개 시나리오)

**총 68개 상세 테스트 시나리오**

---

## 테스트 환경 설정

### 사전 준비사항

```bash
# 의존성 설치
npm install

# Playwright 설치
npx playwright install

# 데이터베이스 설정
npm run db:push

# 개발 서버 실행 (포트 3003)
npm run dev
```

### 테스트 데이터 준비

필수 테스트 계정:
- **ADMIN**: admin@k-glow.com / admin123!@#
- **BRAND**: brand@test.com / brand123!@#
- **BUYER**: buyer@test.com / buyer123!@#

샘플 데이터:
- 파트너사 5개 이상
- 각 파트너사당 제품 3-10개
- 인증 신청 데이터 (다양한 상태)

---

## 1. 네비게이션 및 공통 UI 테스트

### 1.1 네비게이션 메뉴 - 데스크톱

**우선순위**: P0 (Critical)

**시나리오**: 모든 메뉴 링크가 올바른 페이지로 이동

**단계**:
1. 홈페이지(/) 접속
2. 각 메뉴 클릭하여 이동 확인:
   - "파트너사" → `/partners`
   - "견적 계산" → `/calculator`
   - "브랜드 분석" → `/analyze`
   - "인증 대행" → `/certification/new`
3. 로고 클릭 → `/` 홈으로 이동

**예상 결과**: 모든 링크 정상 작동, URL 변경 확인

```typescript
test('네비게이션 메뉴 링크', async ({ page }) => {
  await page.goto('/');

  await page.click('text=파트너사');
  await expect(page).toHaveURL('/partners');

  await page.click('text=견적 계산');
  await expect(page).toHaveURL('/calculator');

  await page.click('text=K-Glow');
  await expect(page).toHaveURL('/');
});
```

### 1.2 모바일 네비게이션

**우선순위**: P1 (High)

**시나리오**: 모바일에서 햄버거 메뉴 작동

**단계**:
1. 뷰포트를 375x667로 설정
2. 햄버거 메뉴 버튼 클릭
3. 메뉴 펼쳐짐 확인
4. 메뉴 항목 클릭 → 해당 페이지 이동
5. 메뉴 자동 닫힘 확인

**예상 결과**: 모바일 메뉴 정상 작동

```typescript
test('모바일 네비게이션', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.click('button[aria-label="메뉴"]');
  await expect(page.locator('text=파트너사').first()).toBeVisible();

  await page.click('text=파트너사');
  await expect(page).toHaveURL('/partners');
});
```

### 1.3 로그인 전 네비게이션

**우선순위**: P0

**시나리오**: 미인증 사용자에게 로그인/회원가입 버튼 표시

**단계**:
1. 로그아웃 상태에서 홈페이지 접속
2. "로그인" 버튼 표시 확인
3. "회원가입" 버튼 표시 확인
4. 사용자 프로필 메뉴 미표시 확인

**예상 결과**: 인증 전용 UI 표시

### 1.4 로그인 후 네비게이션 (BRAND)

**우선순위**: P0

**시나리오**: BRAND 사용자 로그인 후 프로필 메뉴

**단계**:
1. BRAND 계정 로그인
2. 프로필 아이콘 클릭
3. 드롭다운에서 확인:
   - 사용자 이름, 이메일
   - "BRAND" 역할 배지
   - "내 인증 현황" 링크
   - "로그아웃" 버튼
4. ADMIN 메뉴 미표시 확인

**예상 결과**: BRAND 역할에 맞는 메뉴 표시

### 1.5 ADMIN 사용자 네비게이션

**우선순위**: P1

**시나리오**: ADMIN 사용자에게 관리자 메뉴 표시

**단계**:
1. ADMIN 계정 로그인
2. 프로필 메뉴에서 "관리자 대시보드" 링크 확인
3. 클릭 → `/admin` 이동

**예상 결과**: ADMIN만 관리자 메뉴 접근 가능

---

## 2. 홈페이지 테스트

### 2.1 홈페이지 레이아웃

**우선순위**: P0

**시나리오**: 모든 섹션 정상 표시

**단계**:
1. `/` 접속
2. 요소 확인:
   - "K-Glow" 제목 (그라디언트)
   - 4개 기능 카드 (파트너사, 견적, 분석, 인증)
   - "왜 K-Glow인가?" 섹션
   - "지금 시작하기" CTA 버튼

**예상 결과**: 모든 섹션 표시

```typescript
test('홈페이지 레이아웃', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1:has-text("K-Glow")')).toBeVisible();
  await expect(page.locator('text=파트너사')).toBeVisible();
  await expect(page.locator('text=AI 자동화')).toBeVisible();
});
```

### 2.2 기능 카드 링크

**우선순위**: P0

**시나리오**: 카드 클릭 시 해당 페이지 이동

**단계**:
1. "파트너사" 카드 → `/partners`
2. "견적 계산" 카드 → `/calculator`
3. "브랜드 분석" 카드 → `/analyze`
4. "인증 대행" 카드는 비활성화 (회색)

**예상 결과**: 활성 카드만 이동

### 2.3 CTA 버튼

**우선순위**: P1

**시나리오**: "지금 시작하기" 버튼 클릭

**단계**:
1. 하단 CTA 버튼 클릭
2. `/analyze` 페이지로 이동 확인

**예상 결과**: 브랜드 분석 페이지로 이동

---

## 3. 인증 및 사용자 관리 테스트

### 3.1 회원가입 - BRAND (정상)

**우선순위**: P0

**시나리오**: 신규 BRAND 계정 생성

**단계**:
1. `/auth/signup` 접속
2. 폼 입력:
   - 이메일: newbrand@test.com
   - 이름: 신규 브랜드
   - 회사명: 테스트 화장품
   - 계정 유형: 브랜드 (라디오)
   - 비밀번호: Test1234!@#$
   - 비밀번호 확인: Test1234!@#$
3. "회원가입" 클릭
4. `/auth/signin`으로 리다이렉트

**예상 결과**: 회원가입 성공, 로그인 페이지 이동

```typescript
test('BRAND 회원가입', async ({ page }) => {
  await page.goto('/auth/signup');

  await page.fill('input[type="email"]', 'newbrand@test.com');
  await page.fill('input[name="name"]', '신규 브랜드');
  await page.fill('input[name="companyName"]', '테스트 화장품');
  await page.check('input[value="BRAND"]');
  await page.locator('input[type="password"]').first().fill('Test1234!@#$');
  await page.locator('input[type="password"]').last().fill('Test1234!@#$');

  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/auth\/signin/);
});
```

### 3.2 회원가입 - 비밀번호 불일치

**우선순위**: P1

**시나리오**: 비밀번호 확인 다를 때 오류

**단계**:
1. 회원가입 폼에서 비밀번호와 확인이 다르게 입력
2. 제출 시 오류 메시지 표시
3. 폼 제출 안 됨

**예상 결과**: 오류 메시지, 제출 실패

### 3.3 회원가입 - 짧은 비밀번호

**우선순위**: P1

**시나리오**: 8자 미만 비밀번호 거부

**단계**:
1. 비밀번호 7자 입력
2. 오류 메시지: "최소 8자 이상"

**예상 결과**: 검증 오류

### 3.4 회원가입 - 중복 이메일

**우선순위**: P1

**시나리오**: 기존 이메일로 가입 시도

**단계**:
1. 이미 등록된 이메일 입력
2. API 오류 메시지 표시

**예상 결과**: 중복 이메일 거부

### 3.5 로그인 - 정상 플로우

**우선순위**: P0

**시나리오**: 이메일/비밀번호로 로그인

**단계**:
1. `/auth/signin` 접속
2. 이메일: brand@test.com
3. 비밀번호: brand123!@#
4. 로그인 → `/` 리다이렉트
5. 사용자 이름 표시 확인

**예상 결과**: 로그인 성공

```typescript
test('이메일 로그인', async ({ page }) => {
  await page.goto('/auth/signin');

  await page.fill('input[type="email"]', 'brand@test.com');
  await page.fill('input[type="password"]', 'brand123!@#');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/');
  await expect(page.locator('text=Brand User')).toBeVisible();
});
```

### 3.6 로그인 - 잘못된 비밀번호

**우선순위**: P1

**시나리오**: 틀린 비밀번호 입력

**단계**:
1. 올바른 이메일, 잘못된 비밀번호
2. 오류 메시지 표시

**예상 결과**: 로그인 실패

### 3.7 로그인 - 존재하지 않는 계정

**우선순위**: P1

**시나리오**: 미등록 이메일로 로그인

**단계**:
1. 존재하지 않는 이메일 입력
2. 오류 메시지

**예상 결과**: 로그인 실패

### 3.8 로그아웃

**우선순위**: P0

**시나리오**: 로그아웃 기능

**단계**:
1. 로그인 후 프로필 메뉴 클릭
2. "로그아웃" 클릭
3. 홈으로 리다이렉트
4. "로그인" 버튼 다시 표시

**예상 결과**: 로그아웃 성공

### 3.9 미인증 리다이렉트

**우선순위**: P0

**시나리오**: 로그인 필요 페이지 접근 시 리다이렉트

**단계**:
1. 로그아웃 상태에서 `/certification/new` 접속
2. `/auth/signin?callbackUrl=/certification/new` 리다이렉트
3. 로그인 후 원래 페이지로 복귀

**예상 결과**: 로그인 후 자동 복귀

```typescript
test('미인증 리다이렉트', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/certification/new');

  await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=/);
});
```

### 3.10 ADMIN 접근 제어

**우선순위**: P0

**시나리오**: 비관리자의 관리자 페이지 차단

**단계**:
1. BRAND로 로그인
2. `/admin` 접속 시도
3. `/auth/error?error=unauthorized` 리다이렉트

**예상 결과**: 접근 거부

---

## 4. 파트너사 관리 테스트

### 4.1 파트너사 목록 표시

**우선순위**: P0

**시나리오**: 파트너사 목록 페이지 로드

**단계**:
1. `/partners` 접속
2. 요소 확인:
   - "파트너사 목록" 제목
   - 검색창
   - 파트너사 카드 (3열 그리드)
   - 각 카드: 브랜드명, 제품 수, 시장 점수
3. 통계 정보 (총 파트너사, 평균 점수, 총 제품)

**예상 결과**: 모든 파트너사 표시

```typescript
test('파트너사 목록', async ({ page }) => {
  await page.goto('/partners');

  await expect(page.locator('h1:has-text("파트너사 목록")')).toBeVisible();
  await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();

  const cards = page.locator('[href^="/partners/"]');
  await expect(cards.first()).toBeVisible();
});
```

### 4.2 파트너사 검색

**우선순위**: P1

**시나리오**: 브랜드명 검색

**단계**:
1. 검색창에 키워드 입력
2. 검색 버튼 클릭
3. 결과 필터링 확인
4. 검색 초기화 시 전체 복원

**예상 결과**: 검색 정상 작동

```typescript
test('파트너사 검색', async ({ page }) => {
  await page.goto('/partners');

  const allCards = await page.locator('[href^="/partners/"]').count();

  await page.fill('input[placeholder*="검색"]', '이니스프리');
  await page.click('button:has-text("검색")');

  await page.waitForLoadState('networkidle');
  const searchCards = await page.locator('[href^="/partners/"]').count();

  expect(searchCards).toBeLessThanOrEqual(allCards);
});
```

### 4.3 파트너사 상세 페이지

**우선순위**: P0

**시나리오**: 상세 정보 표시

**단계**:
1. 파트너사 카드 클릭
2. `/partners/[id]` 이동
3. 상세 정보 확인:
   - 브랜드명, 로고
   - 시장 점수
   - 제품 목록

**예상 결과**: 상세 정보 표시

```typescript
test('파트너사 상세', async ({ page }) => {
  await page.goto('/partners');

  await page.locator('[href^="/partners/"]').first().click();
  await expect(page).toHaveURL(/\/partners\/[a-zA-Z0-9-]+/);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('text=제품 목록')).toBeVisible();
});
```

### 4.4 빈 상태

**우선순위**: P2

**시나리오**: 파트너사 없을 때 안내

**단계**:
1. 빈 상태에서 `/partners` 접속
2. "등록된 파트너사가 없습니다" 메시지
3. "브랜드 분석하러 가기" 버튼 → `/analyze`

**예상 결과**: 빈 상태 UI

### 4.5 외부 링크

**우선순위**: P2

**시나리오**: 웹사이트 링크 새 탭

**단계**:
1. "🔗 웹사이트" 클릭
2. 새 탭에서 열림 확인
3. `target="_blank"`, `rel="noopener"` 확인

**예상 결과**: 안전하게 외부 링크

---

## 5. 견적 계산기 테스트

### 5.1 페이지 로드

**우선순위**: P0

**시나리오**: 초기 상태 확인

**단계**:
1. `/calculator` 접속
2. 요소 확인:
   - 실시간 환율 표시
   - 제품 입력란 (1개)
   - 배송 정보
   - 인증 정보
   - "견적 계산하기" 버튼 (비활성화)

**예상 결과**: 모든 섹션 표시

```typescript
test('계산기 페이지 로드', async ({ page }) => {
  await page.goto('/calculator');

  await expect(page.locator('h1:has-text("견적 계산기")')).toBeVisible();
  await expect(page.locator('text=1 KRW')).toBeVisible();

  const calcButton = page.locator('button:has-text("견적 계산하기")');
  await expect(calcButton).toBeDisabled();
});
```

### 5.2 단일 제품 계산

**우선순위**: P0

**시나리오**: 제품 1개 견적

**단계**:
1. 제품 정보 입력:
   - 제품명: 수분 크림
   - 수량: 100
   - 가격: 50000
   - 무게: 5kg
   - 부피: 0.1m³
2. "견적 계산하기" 클릭
3. 결과 확인:
   - 제품 합계: ₩5,000,000
   - 배송비, 관세(6.5%), 부가세(20%)
   - 총 금액 (원화/루블)

**예상 결과**: 정확한 계산

```typescript
test('단일 제품 견적', async ({ page }) => {
  await page.goto('/calculator');

  await page.fill('input[placeholder="제품명"]', '수분 크림');
  await page.fill('input[placeholder="수량"]', '100');
  await page.fill('input[placeholder="가격(원)"]', '50000');
  await page.fill('input[placeholder="무게(kg)"]', '5');
  await page.fill('input[placeholder="부피(m³)"]', '0.1');

  await page.click('button:has-text("견적 계산하기")');

  await expect(page.locator('text=견적 결과')).toBeVisible();
  await expect(page.locator('text=₩5,000,000')).toBeVisible();
});
```

### 5.3 다중 제품 추가

**우선순위**: P1

**시나리오**: 여러 제품 계산

**단계**:
1. "+ 제품 추가" 클릭
2. 제품 2개 입력
3. 총 무게/부피 자동 계산
4. 견적 계산 → 합산 확인

**예상 결과**: 다중 제품 합산

```typescript
test('다중 제품', async ({ page }) => {
  await page.goto('/calculator');

  await page.fill('input[placeholder="제품명"]', '수분 크림');
  await page.fill('input[placeholder="가격(원)"]', '50000');

  await page.click('button:has-text("+ 제품 추가")');

  const productSections = page.locator('text=제품').filter({ hasText: /제품 [12]/ });
  await expect(productSections).toHaveCount(2);
});
```

### 5.4 제품 삭제

**우선순위**: P1

**시나리오**: 추가한 제품 삭제

**단계**:
1. 제품 2개 추가
2. 두 번째 제품 삭제
3. 1개로 줄어듦 확인
4. 마지막 제품 삭제 버튼 미표시

**예상 결과**: 삭제 기능, 최소 1개 유지

### 5.5 배송 방법 변경

**우선순위**: P1

**시나리오**: 항공/해상 비용 차이

**단계**:
1. 해상 운송 선택 → 견적 계산
2. 항공 운송 선택 → 견적 재계산
3. 항공이 더 비싼지 확인

**예상 결과**: 항공 > 해상 비용

### 5.6 인증 비용 계산

**우선순위**: P1

**시나리오**: EAC 인증 선택

**단계**:
1. 인증 종류: EAC (500,000원)
2. 제품 수: 2
3. 인증 비용: ₩1,000,000 확인

**예상 결과**: 인증 비용 추가

### 5.7 필수 항목 검증

**우선순위**: P0

**시나리오**: 미입력 시 버튼 비활성화

**단계**:
1. 제품명만 입력
2. 버튼 비활성화 확인
3. 가격 입력 → 활성화

**예상 결과**: 필수 검증

```typescript
test('필수 항목 검증', async ({ page }) => {
  await page.goto('/calculator');

  const calcButton = page.locator('button:has-text("견적 계산하기")');
  await expect(calcButton).toBeDisabled();

  await page.fill('input[placeholder="제품명"]', '수분 크림');
  await expect(calcButton).toBeDisabled();

  await page.fill('input[placeholder="가격(원)"]', '50000');
  await expect(calcButton).toBeEnabled();
});
```

### 5.8 환율 실패 처리

**우선순위**: P2

**시나리오**: API 실패 시 기본값

**단계**:
1. 환율 API Mock 실패
2. 기본 환율(0.075) 사용
3. 계산 기능 정상 작동

**예상 결과**: 기본값으로 계산 가능

### 5.9 PDF 다운로드 (준비 중)

**우선순위**: P3

**시나리오**: PDF 버튼 클릭

**단계**:
1. 견적 계산 완료
2. "PDF 다운로드" 클릭
3. "준비 중" 알림

**예상 결과**: 준비 중 메시지

---

## 6. 브랜드 분석 테스트

### 6.1 페이지 로드

**우선순위**: P0

**시나리오**: 초기 상태

**단계**:
1. `/analyze` 접속
2. 요소 확인:
   - "브랜드 웹사이트 분석" 제목
   - 4단계 프로세스 설명
   - URL 입력란
   - 크롤링 깊이 슬라이더
   - "DB 저장" 체크박스
   - "🚀 분석 시작" 버튼

**예상 결과**: 모든 요소 표시

```typescript
test('브랜드 분석 로드', async ({ page }) => {
  await page.goto('/analyze');

  await expect(page.locator('h1:has-text("브랜드 웹사이트 분석")')).toBeVisible();
  await expect(page.locator('text=웹 크롤링')).toBeVisible();
  await expect(page.locator('input[type="url"]')).toBeVisible();
});
```

### 6.2 URL 미입력 검증

**우선순위**: P1

**시나리오**: 빈 URL 제출

**단계**:
1. URL 비움
2. "분석 시작" 클릭
3. "URL을 입력해주세요" 알림

**예상 결과**: 검증 오류

### 6.3 크롤링 깊이 조정

**우선순위**: P2

**시나리오**: 슬라이더 조작

**단계**:
1. 슬라이더를 1~4로 변경
2. 각 값 표시 확인

**예상 결과**: 슬라이더 작동

```typescript
test('크롤링 깊이', async ({ page }) => {
  await page.goto('/analyze');

  const slider = page.locator('input[type="range"]');

  await slider.fill('1');
  await expect(page.locator('text=크롤링 깊이: 1')).toBeVisible();

  await slider.fill('4');
  await expect(page.locator('text=크롤링 깊이: 4')).toBeVisible();
});
```

### 6.4 분석 정상 플로우 (Mock)

**우선순위**: P0

**시나리오**: 웹사이트 분석 완료

**단계**:
1. URL 입력
2. "분석 시작" 클릭
3. 진행 상태 표시
4. 결과 확인:
   - 브랜드 정보
   - 제품 목록
   - 시장 점수
5. "파트너사로 등록되었습니다" 메시지

**예상 결과**: 분석 완료, DB 저장

```typescript
test('브랜드 분석 (Mock)', async ({ page }) => {
  await page.route('**/api/analyze-website', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        brand: {
          name: '이니스프리',
          nameRu: 'Иннисфри',
          marketScore: 85,
        },
        products: [{
          name: '그린티 크림',
          nameRu: 'Зеленый чай крем',
          price: 30000,
        }],
      }),
    });
  });

  await page.goto('/analyze');
  await page.fill('input[type="url"]', 'https://www.innisfree.com');
  await page.click('button:has-text("분석 시작")');

  await expect(page.locator('text=이니스프리')).toBeVisible();
});
```

### 6.5 분석 실패 처리

**우선순위**: P1

**시나리오**: API 오류

**단계**:
1. API Mock 500 에러
2. "분석 실패" 메시지
3. 재시도 가능

**예상 결과**: 에러 처리

### 6.6 DB 저장 옵션

**우선순위**: P2

**시나리오**: 체크박스 해제 시 미저장

**단계**:
1. "DB 저장" 해제
2. 분석 완료
3. 파트너사 목록에 미추가

**예상 결과**: 분석만 수행

---

## 7. 인증 대행 테스트

### 7.1 로그인 필수

**우선순위**: P0

**시나리오**: 미로그인 리다이렉트

**단계**:
1. 로그아웃 상태에서 `/certification/new` 접속
2. 로그인 페이지로 리다이렉트

**예상 결과**: 인증 필요

### 7.2 인증 신청 페이지 로드

**우선순위**: P0

**시나리오**: 폼 요소 확인

**단계**:
1. BRAND 로그인
2. `/certification/new` 접속
3. 요소 확인:
   - 파트너사 드롭다운
   - 인증 종류 (EAC, GOST, OTHER)
   - 제품 정보 입력란
   - 파일 업로드
   - "인증 신청하기" 버튼

**예상 결과**: 모든 폼 표시

```typescript
test('인증 신청 로드', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'brand@test.com');
  await page.fill('input[type="password"]', 'brand123!@#');
  await page.click('button[type="submit"]');

  await page.goto('/certification/new');

  await expect(page.locator('h1:has-text("인증 대행 신청")')).toBeVisible();
  await expect(page.locator('select')).toBeVisible();
  await expect(page.locator('input[value="EAC"]')).toBeVisible();
});
```

### 7.3 파트너사 로드

**우선순위**: P1

**시나리오**: 드롭다운에 파트너사 표시

**단계**:
1. 파트너사 선택 드롭다운 클릭
2. 등록된 파트너사 목록 확인

**예상 결과**: 파트너사 목록 표시

### 7.4 파트너사 없을 때

**우선순위**: P2

**시나리오**: 안내 메시지

**단계**:
1. 파트너사 0개 상태
2. "등록된 파트너사가 없습니다" 메시지

**예상 결과**: 안내 표시

### 7.5 인증 종류 선택

**우선순위**: P1

**시나리오**: 각 인증 설명 확인

**단계**:
1. EAC 선택 → "500,000원"
2. GOST 선택 → "300,000원"
3. OTHER 선택 → "400,000원"

**예상 결과**: 가격 표시

```typescript
test('인증 종류', async ({ page }) => {
  await page.goto('/certification/new');

  await page.check('input[value="EAC"]');
  await expect(page.locator('text=500,000원')).toBeVisible();

  await page.check('input[value="GOST"]');
  await expect(page.locator('text=300,000원')).toBeVisible();
});
```

### 7.6 파일 업로드

**우선순위**: P1

**시나리오**: 서류 업로드

**단계**:
1. "파일 선택" 클릭
2. PDF 파일 선택
3. 업로드 진행
4. 파일명, 크기 표시
5. 삭제 버튼 표시

**예상 결과**: 파일 업로드 성공

```typescript
test('파일 업로드', async ({ page }) => {
  await page.goto('/certification/new');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-files/sample.pdf');

  await expect(page.locator('text=sample.pdf')).toBeVisible();
  await expect(page.locator('text=업로드된 파일 (1)')).toBeVisible();
});
```

### 7.7 파일 삭제

**우선순위**: P2

**시나리오**: 업로드 파일 제거

**단계**:
1. 파일 2개 업로드
2. 삭제 버튼 클릭
3. 목록에서 제거
4. 카운트 감소

**예상 결과**: 삭제 작동

### 7.8 정상 제출

**우선순위**: P0

**시나리오**: 인증 신청 완료

**단계**:
1. 모든 필수 정보 입력
2. "인증 신청하기" 클릭
3. "완료되었습니다" 알림
4. `/certification/status` 리다이렉트
5. 신청 내역 표시

**예상 결과**: 신청 성공

```typescript
test('인증 신청 제출', async ({ page }) => {
  await page.goto('/certification/new');

  await page.selectOption('select', { index: 1 });
  await page.check('input[value="EAC"]');
  await page.fill('input[placeholder*="제품명"]', '수분 크림');

  await page.click('button:has-text("인증 신청하기")');

  await expect(page).toHaveURL('/certification/status');
});
```

### 7.9 필수 항목 미입력

**우선순위**: P1

**시나리오**: 검증 오류

**단계**:
1. 파트너사 미선택
2. 제출 시도
3. "필수 항목" 알림

**예상 결과**: 제출 실패

### 7.10 인증 현황 - 목록

**우선순위**: P0

**시나리오**: 신청 내역 확인

**단계**:
1. `/certification/status` 접속
2. 요소 확인:
   - "+ 새 신청" 버튼
   - 필터 (전체, 대기, 진행, 완료)
   - 인증 카드 목록
3. 상태 배지 색상:
   - PENDING: 노란색
   - IN_PROGRESS: 파란색
   - COMPLETED: 초록색
   - REJECTED: 빨간색

**예상 결과**: 목록 표시

```typescript
test('인증 현황 목록', async ({ page }) => {
  await page.goto('/certification/status');

  await expect(page.locator('h1:has-text("인증 신청 현황")')).toBeVisible();
  await expect(page.locator('button:has-text("전체")')).toBeVisible();

  const cards = page.locator('.bg-white.border.rounded-lg');
  await expect(cards.first()).toBeVisible();
});
```

### 7.11 필터링

**우선순위**: P1

**시나리오**: 상태별 필터

**단계**:
1. "대기 중" 클릭 → PENDING만 표시
2. "진행 중" 클릭 → IN_PROGRESS만 표시
3. "완료" 클릭 → COMPLETED만 표시

**예상 결과**: 필터 작동

```typescript
test('인증 필터', async ({ page }) => {
  await page.goto('/certification/status');

  await page.click('button:has-text("대기 중")');

  const badges = page.locator('.bg-yellow-100.text-yellow-800');
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);
});
```

### 7.12 빈 상태

**우선순위**: P2

**시나리오**: 신청 없을 때

**단계**:
1. 신청 0개 상태
2. "신청 내역이 없습니다" 메시지
3. "인증 신청하기" 버튼

**예상 결과**: 빈 상태 UI

### 7.13 상세 페이지

**우선순위**: P1

**시나리오**: 인증 상세 정보

**단계**:
1. 카드에서 "상세보기" 클릭
2. `/certification/[id]` 이동
3. 상세 정보:
   - 인증 종류, 상태
   - 파트너사 정보
   - 예상 비용
   - 첨부 파일

**예상 결과**: 상세 정보 표시

---

## 8. 관리자 기능 테스트

### 8.1 접근 권한

**우선순위**: P0

**시나리오**: ADMIN만 접근

**단계**:
1. ADMIN 로그인 → `/admin` 접근 가능
2. BRAND 로그인 → `/admin` 접근 거부

**예상 결과**: 권한 제어

```typescript
test('ADMIN 접근 권한', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'brand@test.com');
  await page.fill('input[type="password"]', 'brand123!@#');
  await page.click('button[type="submit"]');

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/auth\/error/);
});
```

### 8.2 인증 관리 목록

**우선순위**: P1

**시나리오**: 전체 인증 확인

**단계**:
1. ADMIN 로그인
2. `/admin` 접속
3. 모든 사용자의 인증 신청 표시
4. 상태 변경 드롭다운

**예상 결과**: 전체 인증 관리

### 8.3 상태 변경

**우선순위**: P1

**시나리오**: ADMIN이 상태 변경

**단계**:
1. PENDING → IN_PROGRESS 변경
2. 저장
3. 사용자 화면에서도 변경 확인

**예상 결과**: 상태 변경 성공

---

## 9. 반응형 및 크로스 브라우저

### 9.1 모바일 (375x667)

**우선순위**: P1

**시나리오**: 모바일 레이아웃

**단계**:
1. 뷰포트 375x667 설정
2. 홈: 카드 1열 배치
3. 파트너사: 카드 1열
4. 계산기: 폼/결과 세로 배치

**예상 결과**: 모바일 최적화

```typescript
test('모바일 반응형', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await expect(page.locator('button[aria-label="메뉴"]')).toBeVisible();
});
```

### 9.2 태블릿 (768x1024)

**우선순위**: P2

**시나리오**: 태블릿 레이아웃

**단계**:
1. 뷰포트 768x1024 설정
2. 카드 2열 배치 확인

**예상 결과**: 태블릿 최적화

### 9.3 데스크톱 (1920x1080)

**우선순위**: P2

**시나리오**: 큰 화면 최적화

**단계**:
1. 뷰포트 1920x1080 설정
2. 카드 4열 배치
3. 컨테이너 최대 너비 제한

**예상 결과**: 데스크톱 최적화

### 9.4 Firefox

**우선순위**: P1

**시나리오**: Firefox 호환성

**단계**:
1. Firefox 브라우저 사용
2. 주요 기능 테스트
3. CSS 스타일 확인

**예상 결과**: Firefox 정상 작동

### 9.5 Safari (WebKit)

**우선순위**: P1

**시나리오**: Safari 호환성

**단계**:
1. WebKit 브라우저 사용
2. 파일 업로드 테스트
3. 애니메이션 확인

**예상 결과**: Safari 정상 작동

---

## 10. 성능 및 접근성

### 10.1 페이지 로드 성능

**우선순위**: P2

**시나리오**: 로드 시간 측정

**단계**:
1. 각 페이지 로드 시간 측정
2. 목표: < 3초

**예상 결과**: 목표 시간 내 로드

```typescript
test('로드 성능', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);
});
```

### 10.2 이미지 오류 처리

**우선순위**: P2

**시나리오**: 이미지 로드 실패 처리

**단계**:
1. 이미지 없는 파트너사
2. 오류로 UI 깨지지 않음

**예상 결과**: 안전한 처리

### 10.3 키보드 네비게이션

**우선순위**: P1

**시나리오**: 키보드만으로 탐색

**단계**:
1. Tab으로 요소 순회
2. Enter로 활성화
3. Escape로 모달 닫기

**예상 결과**: 키보드 접근성

```typescript
test('키보드 네비게이션', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  await expect(page).not.toHaveURL('/');
});
```

### 10.4 ARIA 속성

**우선순위**: P2

**시나리오**: 스크린 리더 지원

**단계**:
1. aria-label 확인
2. label 연결 확인
3. role 속성 확인

**예상 결과**: WCAG 2.1 AA 준수

```typescript
test('ARIA 속성', async ({ page }) => {
  await page.goto('/');

  const menuButton = page.locator('button[aria-label="메뉴"]');
  await expect(menuButton).toHaveAttribute('aria-label', '메뉴');
});
```

### 10.5 네트워크 오류 복구

**우선순위**: P1

**시나리오**: API 실패 시 처리

**단계**:
1. 네트워크 오프라인
2. API 호출 시도
3. 에러 메시지 표시
4. 재시도 가능

**예상 결과**: 에러 복구

```typescript
test('네트워크 오류', async ({ page, context }) => {
  await page.goto('/calculator');

  await context.route('**/api/calculate-quote', route => route.abort());

  await page.fill('input[placeholder="제품명"]', '테스트');
  await page.fill('input[placeholder="가격(원)"]', '10000');
  await page.click('button:has-text("견적 계산하기")');

  page.once('dialog', dialog => {
    expect(dialog.message()).toContain('실패');
    dialog.accept();
  });
});
```

---

## 11. Edge Cases 및 보안

### 11.1 XSS 방지

**우선순위**: P0

**시나리오**: 스크립트 입력 차단

**단계**:
1. 입력란에 `<script>alert('XSS')</script>` 입력
2. 스크립트 실행 안 됨
3. 문자열로 표시

**예상 결과**: XSS 방지

### 11.2 SQL Injection 방지

**우선순위**: P0

**시나리오**: SQL 구문 입력 처리

**단계**:
1. 검색창에 `'; DROP TABLE --` 입력
2. 에러 없이 검색 결과 0
3. DB 정상

**예상 결과**: SQL Injection 방지

### 11.3 파일 크기 제한

**우선순위**: P1

**시나리오**: 대용량 파일 거부

**단계**:
1. 15MB 파일 업로드 시도
2. "10MB 이하" 오류

**예상 결과**: 크기 제한

### 11.4 중복 제출 방지

**우선순위**: P1

**시나리오**: 버튼 연속 클릭 방지

**단계**:
1. 제출 버튼 2번 빠르게 클릭
2. 첫 클릭 후 비활성화
3. 중복 API 호출 없음

**예상 결과**: 중복 방지

---

## 테스트 실행 가이드

### 환경 설정

```bash
# 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install

# 데이터베이스 설정
npm run db:push

# 개발 서버 실행 (별도 터미널)
npm run dev
```

### 실행 명령어

```bash
# 모든 테스트 실행
npx playwright test

# 특정 파일 실행
npx playwright test tests/home.spec.ts

# UI 모드 (디버깅)
npx playwright test --ui

# 특정 브라우저
npx playwright test --project=chromium

# 헤드풀 모드
npx playwright test --headed

# 리포트 보기
npx playwright show-report
```

### 테스트 우선순위

**P0 (Critical)**: 로그인, 견적 계산, 인증 신청
**P1 (High)**: 파트너사 검색, 파일 업로드, 브랜드 분석
**P2 (Medium)**: 반응형, 네비게이션, 필터링
**P3 (Low)**: 에러 메시지, 툴팁, 애니메이션

---

## 테스트 커버리지 목표

- **기능 커버리지**: 95% 이상
- **UI 커버리지**: 90% 이상
- **API 엔드포인트**: 100%
- **사용자 플로우**: 모든 주요 플로우

---

## 유지보수 가이드

### 테스트 추가

1. 새 기능 추가 시 테스트 작성
2. 기존 테스트 실패 확인
3. E2E는 사용자 관점
4. 유닛은 별도 디렉토리

### 테스트 실패 시

1. 스크린샷/비디오 확인
2. 트레이스 분석
3. 로그 확인
4. `test.only()`로 디버깅

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-03
**작성자**: Playwright Test Planner Agent

이 테스트 계획서는 K-Glow 플랫폼의 모든 주요 기능을 커버하며, Happy Path뿐만 아니라 Edge Case와 에러 처리까지 포함합니다.
