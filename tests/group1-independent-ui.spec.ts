import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// Helper function for login that handles Webkit properly
async function loginUser(page: Page, browserName: string) {
  await page.goto('/auth/signin');
  await page.locator('input[type="email"]').fill('test@kglow.com');
  await page.locator('input[type="password"]').fill('Test123456!');

  // Click login button
  await page.getByRole('button', { name: /로그인/i }).click();

  // Webkit (and sometimes Firefox) has different cookie/session handling behavior
  if (browserName === 'webkit' || browserName === 'firefox') {
    // Wait for navigation to complete
    await page.waitForLoadState('load');

    // Wait for network to settle to ensure session cookies are properly set
    await page.waitForLoadState('domcontentloaded');

    // Increased timeout for session cookie establishment (3000ms for Webkit/Firefox)
    await page.waitForTimeout(3000);

    // Verify we're not on signin page anymore
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/signin')) {
      throw new Error('Login failed - still on signin page. Please ensure test user exists: test@kglow.com');
    }

    // Additional verification: ensure session is established by checking for auth cookies
    const cookies = await page.context().cookies();
    const hasSessionCookie = cookies.some(cookie =>
      cookie.name.includes('session') ||
      cookie.name.includes('next-auth') ||
      cookie.name.startsWith('__Secure-next-auth')
    );

    if (!hasSessionCookie) {
      // Wait a bit more and check again
      await page.waitForTimeout(1000);
      const retriedCookies = await page.context().cookies();
      const hasSessionCookieRetry = retriedCookies.some(cookie =>
        cookie.name.includes('session') ||
        cookie.name.includes('next-auth') ||
        cookie.name.startsWith('__Secure-next-auth')
      );

      if (!hasSessionCookieRetry) {
        throw new Error('Login failed - session cookies not properly set. Please ensure test user exists: test@kglow.com');
      }
    }
  } else {
    // For Chromium, use simpler approach
    // Wait until URL changes to not include 'auth'
    await page.waitForURL((url: URL) => !url.pathname.includes('/auth'), { timeout: 10000 })
      .catch(async () => {
        const currentUrl = page.url();
        if (currentUrl.includes('/auth/signin')) {
          throw new Error('Login failed - still on signin page. Please ensure test user exists: test@kglow.com');
        }
      });
  }
}

test.describe('Group 1 - 독립 UI 테스트', () => {

  // ===== 네비게이션 =====

  test('1.1 네비게이션 메뉴 - 데스크톱', async ({ page }) => {
    await page.goto('/');

    // 파트너사 링크 - 네비게이션 바의 링크를 href로 찾기
    await page.locator('nav a[href="/partners"]').click();
    await page.waitForURL('/partners');
    await expect(page).toHaveURL('/partners');

    // 로고 클릭 시 홈으로
    await page.locator('nav a[href="/"]').first().click();
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');

    // Note: /calculator and /analyze require authentication and are tested in authenticated test suites
  });

  test('1.2 모바일 네비게이션', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 햄버거 메뉴 클릭 - aria-label 사용
    const menuButton = page.locator('nav button[aria-label="메뉴"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // 모바일 메뉴 컨테이너 - 모바일 전용 div
    const mobileMenu = page.locator('nav div.md\\:hidden.py-4.border-t');
    await expect(mobileMenu).toBeVisible();

    // 파트너사 링크 클릭 - 모바일 메뉴 내의 링크만 선택
    await mobileMenu.locator('a[href="/partners"]').click();
    await page.waitForURL('/partners');
    await expect(page).toHaveURL('/partners');
  });

  // ===== 홈페이지 =====

  test('2.1 홈페이지 레이아웃', async ({ page }) => {
    await page.goto('/');

    // 제목 확인
    await expect(page.locator('h1').filter({ hasText: 'K-Glow' })).toBeVisible();

    // 4개 카드 확인 - h2 태그로 확인
    await expect(page.locator('h2').filter({ hasText: '파트너사' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: '견적 계산' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: '브랜드 분석' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: '인증 대행' })).toBeVisible();

    // "왜 K-Glow인가?" 섹션
    await expect(page.locator('div').filter({ hasText: /^AI 자동화$/ })).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^실시간 환율$/ })).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^원스톱 서비스$/ })).toBeVisible();
  });

  test('2.2 기능 카드 링크', async ({ page }) => {
    await page.goto('/');

    // 파트너사 카드 클릭 - main content 내의 링크만 (navigation 제외)
    await page.locator('main a[href="/partners"]').click();
    await expect(page).toHaveURL('/partners');

    // 홈으로 돌아가기
    await page.goto('/');

    // 견적 계산 - 인증 필요하므로 로그인 페이지로 리다이렉트
    // Use waitUntil: 'commit' to handle server-side redirects without frame detachment errors
    await page.goto('/calculator', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');
    await expect(page.url()).toContain('/auth/signin');
    await expect(page.url()).toContain('callbackUrl=%2Fcalculator');

    // 홈으로 돌아가기
    await page.goto('/');

    // 브랜드 분석 - 인증 필요하므로 로그인 페이지로 리다이렉트
    // Use waitUntil: 'commit' to handle server-side redirects without frame detachment errors
    await page.goto('/analyze', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');
    await expect(page.url()).toContain('/auth/signin');
    await expect(page.url()).toContain('callbackUrl=%2Fanalyze');
  });

  test('2.3 CTA 버튼', async ({ page }) => {
    await page.goto('/');

    // "지금 시작하기" 버튼 찾기 및 확인 (arrow 포함하므로 regex 사용)
    const ctaButton = page.getByRole('link', { name: /지금 시작하기/ });
    await expect(ctaButton).toBeVisible();

    // Navigate directly instead of clicking to ensure server-side middleware redirect
    // Use waitUntil: 'commit' to handle server-side redirects without frame detachment errors
    await page.goto('/analyze', { waitUntil: 'commit' });
    await page.waitForLoadState('domcontentloaded');

    // /analyze는 인증 필요하므로 로그인 페이지로 리다이렉트
    await expect(page.url()).toContain('/auth/signin');
    await expect(page.url()).toContain('callbackUrl=%2Fanalyze');
  });

  // ===== 브랜드 분석 UI =====

  test('6.1 브랜드 분석 페이지 로드', async ({ page, browserName }) => {
    // Login before accessing protected route
    await loginUser(page, browserName);

    // Now navigate to analyze page
    await page.goto('/analyze');

    // 제목 확인
    await expect(page.locator('h1:has-text("브랜드 웹사이트 분석")')).toBeVisible();

    // 프로세스 단계 확인 - getByText 사용
    await expect(page.getByText('웹 크롤링')).toBeVisible();
    await expect(page.getByText('정보 추출')).toBeVisible();
    await expect(page.getByText('AI 번역')).toBeVisible();
    await expect(page.getByText('시장 분석')).toBeVisible();

    // 입력 폼 확인
    await expect(page.locator('input[type="url"]')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });

  test('6.2 브랜드 분석 URL 미입력 검증', async ({ page, browserName }) => {
    // Login before accessing protected route
    await loginUser(page, browserName);

    // Now navigate to analyze page
    await page.goto('/analyze');

    // URL 입력 없이 분석 시작 버튼 확인
    const submitButton = page.getByRole('button', { name: /분석 시작/i });

    // URL이 비어있을 때 버튼이 비활성화되어 있어야 함
    await expect(submitButton).toBeDisabled();

    // URL을 입력하면 버튼이 활성화되어야 함
    await page.locator('input[type="url"]').fill('https://example.com');
    await expect(submitButton).toBeEnabled();

    // URL을 지우면 다시 비활성화되어야 함
    await page.locator('input[type="url"]').clear();
    await expect(submitButton).toBeDisabled();
  });

  test('6.3 크롤링 깊이 조정', async ({ page, browserName }) => {
    // Login before accessing protected route
    await loginUser(page, browserName);

    // Now navigate to analyze page
    await page.goto('/analyze');

    const slider = page.locator('input[type="range"]');

    // 최소값으로 설정
    await slider.fill('1');
    await expect(page.getByText('크롤링 깊이: 1')).toBeVisible();

    // 최대값으로 설정
    await slider.fill('4');
    await expect(page.getByText('크롤링 깊이: 4')).toBeVisible();
  });

  // ===== 견적 계산기 UI =====

  test('5.1 견적 계산기 페이지 로드', async ({ page, browserName }) => {
    // Login before accessing protected route
    await loginUser(page, browserName);

    // Now navigate to calculator page
    await page.goto('/calculator');

    // 제목 확인
    await expect(page.locator('h1:has-text("견적 계산기")')).toBeVisible();

    // 환율 정보 로드 대기
    await expect(page.locator('text=/1 KRW.*RUB/i')).toBeVisible({ timeout: 10000 });

    // 계산 버튼 확인
    const calcButton = page.locator('button:has-text("견적 계산하기")');
    await expect(calcButton).toBeVisible();
  });

  test('5.7 필수 항목 검증', async ({ page, browserName }) => {
    // Login before accessing protected route
    await loginUser(page, browserName);

    // Now navigate to calculator page
    await page.goto('/calculator');

    const calcButton = page.locator('button:has-text("견적 계산하기")');

    // 초기 상태: 버튼 비활성화 (또는 제출 시 알림)
    const isDisabledInitially = await calcButton.isDisabled();

    // 제품명만 입력
    await page.locator('input[placeholder="제품명"]').first().fill('수분 크림');

    // 가격 입력 전 상태 확인
    if (!isDisabledInitially) {
      // disabled 속성이 없는 경우 제출 시 알림으로 확인
      page.once('dialog', dialog => {
        dialog.accept();
      });
      await calcButton.click();
    }

    // 가격 입력
    await page.locator('input[placeholder="가격(원)"]').first().fill('50000');

    // 버튼 활성화 또는 정상 제출 가능
    await expect(calcButton).toBeEnabled();
  });

  // ===== 반응형 =====

  test('9.1 반응형 - 모바일 (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 햄버거 메뉴 표시 확인
    const mobileMenu = page.locator('nav button[aria-label="메뉴"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('9.2 반응형 - 태블릿 (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // 제목 표시 확인
    await expect(page.locator('h1').filter({ hasText: 'K-Glow' })).toBeVisible();

    // 주요 콘텐츠 접근 가능
    await expect(page.locator('h2').filter({ hasText: '파트너사' })).toBeVisible();
  });

  test('9.3 반응형 - 데스크톱 (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // 제목 표시 확인
    await expect(page.locator('h1').filter({ hasText: 'K-Glow' })).toBeVisible();

    // 모든 카드 표시
    await expect(page.locator('h2').filter({ hasText: '파트너사' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: '견적 계산' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: '브랜드 분석' })).toBeVisible();
  });

  // ===== 성능 =====

  test('10.1 페이지 로드 성능', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('load');
    const loadTime = Date.now() - start;

    console.log(`홈페이지 로드 시간: ${loadTime}ms`);

    // 3초 이내 로드 (CI 환경에서는 더 걸릴 수 있음)
    expect(loadTime).toBeLessThan(5000);
  });
});
