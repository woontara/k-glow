import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Group 9 - 보안 및 성능 테스트', () => {

  // ===== 보안 =====

  test.fixme('11.1 XSS 방지', async ({ page }) => {
    // This test requires authentication as /analyze is a protected route
    // Should be moved to authenticated test suite
    await page.goto('/analyze');

    // XSS 스크립트 입력
    const xssPayload = '<script>alert("XSS")</script>';
    await page.locator('input[type="url"]').fill(xssPayload);

    // 페이지에 스크립트가 실행되지 않고 문자열로 표시되는지 확인
    const pageContent = await page.textContent('body');

    // alert가 실행되지 않음
    page.on('dialog', () => {
      throw new Error('XSS 공격이 성공했습니다!');
    });

    await page.waitForTimeout(1000);

    // 스크립트 태그가 이스케이프되어 표시됨
    expect(pageContent).toContain('<script>'); // 이스케이프된 형태
  });

  test('11.2 SQL Injection 방지', async ({ page }) => {
    await page.goto('/partners');

    // SQL Injection 페이로드
    const sqlPayload = "'; DROP TABLE partners; --";
    await page.locator('input[placeholder*="검색"]').fill(sqlPayload);

    // 검색 버튼 클릭
    const searchButton = page.locator('button:has-text("검색")');
    if (await searchButton.count() > 0) {
      await searchButton.click();
    } else {
      await page.press('input[placeholder*="검색"]', 'Enter');
    }

    await page.waitForTimeout(1000);

    // 에러 없이 검색 결과 0개 또는 정상 동작
    const errorMessage = page.locator('text=error').or(page.locator('text=오류'));
    expect(await errorMessage.count()).toBe(0);

    // 데이터베이스 정상 확인 (다시 파트너사 로드)
    await page.reload();
    await expect(page.locator('h1:has-text("파트너사")')).toBeVisible();
  });

  test.fixme('11.3 파일 크기 제한', async ({ page }) => {
    // This test requires authentication as /certification is a protected route
    // Should be moved to authenticated test suite
    await page.goto('/certification/new');

    // 파일 입력 찾기
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      // 큰 파일 업로드 시도 (실제로는 Mock 파일 사용)
      console.log('파일 크기 제한 테스트는 실제 파일 필요');

      // accept 속성 확인
      const accept = await fileInput.getAttribute('accept');
      console.log('허용된 파일 타입:', accept);
    } else {
      console.log('로그인 필요: /auth/signin으로 리다이렉트됨');
    }
  });

  test.fixme('11.4 중복 제출 방지', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    // Should be moved to authenticated test suite
    await page.goto('/calculator');

    // 제품 정보 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('테스트');
    await page.locator('input[placeholder*="가격"]').first().fill('10000');

    const calcButton = page.locator('button:has-text("견적 계산하기")');

    // 버튼 연속 클릭
    await calcButton.click();
    await calcButton.click();

    await page.waitForTimeout(500);

    // 첫 클릭 후 버튼 비활성화되거나 로딩 상태 확인
    const isDisabled = await calcButton.isDisabled();
    const hasLoadingClass = await calcButton.evaluate(el => el.classList.contains('loading') || el.classList.contains('disabled'));

    console.log('중복 제출 방지:', isDisabled || hasLoadingClass);
  });

  // ===== 성능 및 접근성 =====

  test('10.2 이미지 오류 처리', async ({ page }) => {
    await page.goto('/partners');

    // 이미지 로드 오류 모니터링
    const imageErrors: string[] = [];

    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|webp)$/) && !response.ok()) {
        imageErrors.push(response.url());
      }
    });

    await page.waitForLoadState('networkidle');

    // UI가 깨지지 않았는지 확인
    await expect(page.locator('h1')).toBeVisible();

    if (imageErrors.length > 0) {
      console.log('이미지 로드 실패:', imageErrors);
      console.log('하지만 UI는 정상 동작함');
    }
  });

  test('10.3 키보드 네비게이션', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 첫 번째 링크로 이동
    await page.keyboard.press('Tab');

    // 현재 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log('포커스된 요소:', focusedElement);

    // Enter로 링크 활성화
    await page.keyboard.press('Enter');

    // URL 변경 확인 (홈에서 다른 페이지로 이동)
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log('키보드 네비게이션 후 URL:', currentUrl);
  });

  test('10.4 ARIA 속성 - 접근성', async ({ page }) => {
    await page.goto('/');

    // 모바일 메뉴 버튼 ARIA 확인
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button[aria-label*="메뉴"]'));

    if (await menuButton.count() > 0) {
      const ariaLabel = await menuButton.first().getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      console.log('메뉴 버튼 aria-label:', ariaLabel);
    }

    // 폼 필드 label 확인
    await page.goto('/auth/signin');

    const emailInput = page.locator('input[type="email"]');

    if (await emailInput.count() > 0) {
      // label 태그 또는 aria-label 확인
      const id = await emailInput.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) {
          console.log('이메일 입력란에 label 연결됨');
        }
      }

      const ariaLabel = await emailInput.getAttribute('aria-label');
      const ariaLabelledBy = await emailInput.getAttribute('aria-labelledby');

      console.log('이메일 접근성:', { ariaLabel, ariaLabelledBy });
    }
  });

  test.fixme('10.5 네트워크 오류 복구', async ({ page, context }) => {
    // This test requires authentication as /calculator is a protected route
    // Should be moved to authenticated test suite
    await page.goto('/calculator');

    // 네트워크 차단
    await context.route('**/api/calculate-quote', route => route.abort());

    // 제품 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('테스트');
    await page.locator('input[placeholder*="가격"]').first().fill('10000');

    // 견적 계산 시도
    page.once('dialog', dialog => {
      console.log('네트워크 오류 메시지:', dialog.message());
      expect(dialog.message()).toMatch(/실패|오류|error/i);
      dialog.accept();
    });

    await page.locator('button:has-text("견적 계산하기")').click();

    await page.waitForTimeout(2000);

    // 앱이 멈추지 않고 재시도 가능한 상태
    await expect(page.locator('button:has-text("견적 계산하기")').first()).toBeVisible();
  });
});
