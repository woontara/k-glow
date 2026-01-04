import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Group 2 - 파트너사 읽기 테스트', () => {

  test('4.1 파트너사 목록 표시', async ({ page }) => {
    await page.goto('/partners');

    // 제목 확인
    await expect(page.locator('h1:has-text("파트너사 목록")')).toBeVisible();

    // 검색창 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();

    // 파트너사 카드 존재 확인
    const cards = page.locator('[href^="/partners/"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
      console.log(`파트너사 수: ${cardCount}개`);
    } else {
      console.log('파트너사 데이터가 없습니다. 테스트 데이터를 생성해주세요.');
    }
  });

  test('4.2 파트너사 검색', async ({ page }) => {
    await page.goto('/partners');

    // 검색 전 카드 수 확인
    await page.waitForLoadState('networkidle');
    const allCards = await page.locator('[href^="/partners/"]').count();

    if (allCards > 0) {
      // 검색창에 키워드 입력
      const searchInput = page.locator('input[placeholder*="검색"]');
      await searchInput.fill('이니스프리');

      // 검색 버튼 클릭 (있는 경우)
      const searchButton = page.locator('button:has-text("검색")');
      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        // Enter로 검색
        await searchInput.press('Enter');
      }

      await page.waitForTimeout(1000); // 검색 결과 대기

      // 검색 결과 확인
      const searchCards = await page.locator('[href^="/partners/"]').count();
      console.log(`검색 전: ${allCards}개, 검색 후: ${searchCards}개`);

      // 검색어 삭제 후 전체 복원 확인
      await searchInput.clear();
      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      await page.waitForTimeout(1000);
      const restoredCards = await page.locator('[href^="/partners/"]').count();
      expect(restoredCards).toBe(allCards);
    }
  });

  test('4.3 파트너사 상세 페이지', async ({ page }) => {
    await page.goto('/partners');

    // 첫 번째 카드 클릭
    const firstCard = page.locator('[href^="/partners/"]').first();

    if (await firstCard.count() > 0) {
      await firstCard.click();

      // URL 확인
      await expect(page).toHaveURL(/\/partners\/[a-zA-Z0-9-]+/);

      // 브랜드 정보 확인
      await expect(page.locator('h1')).toBeVisible();

      // 제품 목록 섹션 확인
      const productsSection = page.locator('text=제품 목록').or(page.locator('text=제품'));
      if (await productsSection.count() > 0) {
        await expect(productsSection.first()).toBeVisible();
      }
    }
  });

  test('4.4 빈 상태', async ({ page, context }) => {
    // 새 컨텍스트로 빈 상태 시뮬레이션 (실제로는 별도 DB 필요)
    await page.goto('/partners');

    const cards = await page.locator('[href^="/partners/"]').count();

    if (cards === 0) {
      // 빈 상태 메시지 확인
      await expect(page.locator('text=등록된 파트너사가 없습니다')).toBeVisible();

      // "브랜드 분석하러 가기" 버튼
      const analyzeButton = page.locator('a:has-text("브랜드 분석")').or(page.locator('button:has-text("브랜드 분석")'));
      if (await analyzeButton.count() > 0) {
        await analyzeButton.click();
        await expect(page).toHaveURL('/analyze');
      }
    } else {
      console.log('파트너사 데이터가 있습니다. 빈 상태 테스트를 위해서는 별도 DB가 필요합니다.');
    }
  });

  test('4.5 외부 링크', async ({ page, context }) => {
    await page.goto('/partners');

    const websiteLink = page.locator('a:has-text("🔗 웹사이트")').or(page.locator('a[target="_blank"]')).first();

    if (await websiteLink.count() > 0) {
      // target="_blank" 속성 확인
      const target = await websiteLink.getAttribute('target');
      expect(target).toBe('_blank');

      // rel="noopener noreferrer" 확인 (보안)
      const rel = await websiteLink.getAttribute('rel');
      expect(rel).toContain('noopener');
    } else {
      console.log('외부 링크를 찾을 수 없습니다.');
    }
  });
});
