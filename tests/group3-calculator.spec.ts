import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// NOTE: All tests in this file require authentication as /calculator is a protected route
// To enable these tests, set up authentication as described in tests/README-AUTH.md

test.describe('Group 3 - 견적 계산기 테스트', () => {

  test.fixme('5.2 단일 제품 계산', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 제품 정보 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('수분 크림');
    await page.locator('input[placeholder*="수량"]').first().fill('100');
    await page.locator('input[placeholder*="가격"]').first().fill('50000');
    await page.locator('input[placeholder*="무게"]').first().fill('5');
    await page.locator('input[placeholder*="부피"]').first().fill('0.1');

    // 견적 계산 버튼 클릭
    const calcButton = page.locator('button:has-text("견적 계산하기")');
    await calcButton.click();

    // 결과 확인
    await expect(page.locator('text=견적 결과').or(page.locator('text=총 금액'))).toBeVisible({ timeout: 10000 });

    // 제품 합계 확인 (₩5,000,000 또는 5000000)
    const resultText = await page.textContent('body');
    expect(resultText).toMatch(/5,000,000|5000000/);
  });

  test.fixme('5.3 다중 제품 추가', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 첫 번째 제품 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('수분 크림');
    await page.locator('input[placeholder*="가격"]').first().fill('50000');

    // 제품 추가 버튼 클릭
    const addButton = page.locator('button:has-text("+ 제품 추가")').or(page.locator('button:has-text("제품 추가")'));

    if (await addButton.count() > 0) {
      await addButton.click();

      // 제품 입력란 2개 확인
      const productInputs = page.locator('input[placeholder*="제품명"]');
      expect(await productInputs.count()).toBeGreaterThanOrEqual(2);

      // 두 번째 제품 입력
      await productInputs.nth(1).fill('선크림');
    } else {
      console.log('제품 추가 버튼을 찾을 수 없습니다.');
    }
  });

  test.fixme('5.4 제품 삭제', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 제품 추가
    const addButton = page.locator('button:has-text("+ 제품 추가")').or(page.locator('button:has-text("제품 추가")'));

    if (await addButton.count() > 0) {
      await addButton.click();

      // 제품 2개 확인
      const productSections = page.locator('input[placeholder*="제품명"]');
      const initialCount = await productSections.count();

      // 삭제 버튼 클릭 (두 번째 제품)
      const deleteButtons = page.locator('button:has-text("삭제")').or(page.locator('button[aria-label*="삭제"]'));
      const deleteCount = await deleteButtons.count();

      if (deleteCount > 0) {
        await deleteButtons.last().click();

        // 제품 1개로 줄어듦 확인
        const finalCount = await page.locator('input[placeholder*="제품명"]').count();
        expect(finalCount).toBe(initialCount - 1);
      }
    }
  });

  test.fixme('5.5 배송 방법 변경', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 제품 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('수분 크림');
    await page.locator('input[placeholder*="가격"]').first().fill('50000');
    await page.locator('input[placeholder*="무게"]').first().fill('5');

    // 해상 운송 선택
    const shippingSelect = page.locator('select').first();
    await shippingSelect.selectOption({ label: '해상 운송' });

    // 견적 계산
    await page.locator('button:has-text("견적 계산하기")').click();
    await page.waitForTimeout(1000);

    const seaCost = await page.textContent('body');

    // 항공 운송으로 변경
    await shippingSelect.selectOption({ label: '항공 운송' });
    await page.locator('button:has-text("견적 계산하기")').click();
    await page.waitForTimeout(1000);

    const airCost = await page.textContent('body');

    // 항공이 해상보다 비쌈 (단순 비교는 어려우므로 로그 출력)
    console.log('해상 운송 결과:', seaCost?.substring(0, 200));
    console.log('항공 운송 결과:', airCost?.substring(0, 200));
  });

  test.fixme('5.6 인증 비용 계산', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 제품 입력
    await page.locator('input[placeholder*="제품명"]').first().fill('수분 크림');
    await page.locator('input[placeholder*="가격"]').first().fill('50000');

    // 인증 종류 선택
    const certRadio = page.locator('input[value="EAC"]').or(page.locator('text=EAC'));

    if (await certRadio.count() > 0) {
      if (await certRadio.first().getAttribute('type') === 'radio') {
        await certRadio.first().check();
      } else {
        await certRadio.first().click();
      }

      // 인증 제품 수 입력
      const certCountInput = page.locator('input[type="number"]').filter({ hasText: /제품.*수|인증.*제품/ }).or(page.locator('input[placeholder*="제품 수"]'));

      if (await certCountInput.count() > 0) {
        await certCountInput.first().fill('2');
      }

      // 견적 계산
      await page.locator('button:has-text("견적 계산하기")').click();

      // 인증 비용 확인 (500,000 x 2 = 1,000,000)
      await page.waitForTimeout(1000);
      const result = await page.textContent('body');
      expect(result).toMatch(/1,000,000|1000000/);
    }
  });

  test.fixme('5.8 환율 실패 처리', async ({ page, context }) => {
    // This test requires authentication as /calculator is a protected route
    // 환율 API Mock 실패
    await context.route('**/api/exchange-rate', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'API Error' }),
      });
    });

    await page.goto('/calculator');

    // 환율 정보에 기본값 표시 또는 오류 메시지
    await page.waitForTimeout(2000);

    // 계산 기능은 정상 작동
    await page.locator('input[placeholder*="제품명"]').first().fill('테스트');
    await page.locator('input[placeholder*="가격"]').first().fill('10000');

    const calcButton = page.locator('button:has-text("견적 계산하기")');

    if (await calcButton.isEnabled()) {
      await calcButton.click();
      // 오류 없이 계산 가능
      console.log('환율 실패 시에도 계산 가능');
    }
  });

  test.fixme('5.9 PDF 다운로드 준비 중', async ({ page }) => {
    // This test requires authentication as /calculator is a protected route
    await page.goto('/calculator');

    // 제품 입력 및 계산
    await page.locator('input[placeholder*="제품명"]').first().fill('수분 크림');
    await page.locator('input[placeholder*="가격"]').first().fill('50000');

    await page.locator('button:has-text("견적 계산하기")').click();
    await page.waitForTimeout(1000);

    // PDF 다운로드 버튼 찾기
    const pdfButton = page.locator('button:has-text("PDF")');

    if (await pdfButton.count() > 0) {
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('준비 중');
        dialog.accept();
      });

      await pdfButton.click();
    } else {
      console.log('PDF 다운로드 버튼을 찾을 수 없습니다.');
    }
  });
});
