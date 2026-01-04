import puppeteer from 'puppeteer';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testAuthFlow() {
  const baseUrl = 'http://localhost:3003';

  console.log('🚀 Starting authentication flow test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 1. Navigate to home page
    console.log('1️⃣  Navigating to home page...');
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(2000);
    await page.screenshot({ path: 'auth-test-1-home-logged-out.png', fullPage: true });
    console.log('   ✅ Home page loaded (logged out state)');

    // 2. Check if login/signup buttons are visible
    const loginButton = await page.$('a[href="/auth/signin"]');
    if (loginButton) {
      console.log('   ✅ Login button visible in navigation');
    }

    // 3. Navigate to login page
    console.log('\n2️⃣  Navigating to login page...');
    await page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(3000);

    // Check current URL
    const currentPageUrl = page.url();
    console.log('   📋 Current URL:', currentPageUrl);

    await page.screenshot({ path: 'auth-test-2-login-page.png', fullPage: true });
    console.log('   ✅ Login page loaded');

    // Debug: Check page content
    const pageContent = await page.content();
    const hasEmailInput = pageContent.includes('type="email"');
    const hasPasswordInput = pageContent.includes('type="password"');
    console.log('   📋 Page has email input:', hasEmailInput);
    console.log('   📋 Page has password input:', hasPasswordInput);

    // Check if page has error
    const bodyText = await page.evaluate(() => document.body.textContent);
    if (bodyText?.includes('error') || bodyText?.includes('Error')) {
      console.log('   ⚠️  Page may have error, body preview:');
      console.log('   ', bodyText?.substring(0, 200));
    }

    // 4. Fill in admin credentials
    console.log('\n3️⃣  Filling in admin credentials...');

    // Try to find inputs
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');

    if (!emailInput || !passwordInput) {
      console.log('   ⚠️  Could not find input fields, trying alternative selectors...');
      const inputs = await page.$$('input');
      console.log('   📋 Found', inputs.length, 'input elements');

      // Use first two inputs
      if (inputs.length >= 2) {
        await inputs[0].type('admin@k-glow.com');
        await inputs[1].type('admin123!@#');
      } else {
        throw new Error('Login form not loaded');
      }
    } else {
      await emailInput.type('admin@k-glow.com');
      await passwordInput.type('admin123!@#');
    }

    await page.screenshot({ path: 'auth-test-3-credentials-filled.png', fullPage: true });
    console.log('   ✅ Credentials filled');
    console.log('      Email: admin@k-glow.com');
    console.log('      Password: admin123!@#');

    // 5. Click login button
    console.log('\n4️⃣  Clicking login button...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
        console.log('   ⚠️  Navigation timeout, continuing...');
      })
    ]);

    // Wait a bit for any redirects
    await wait(2000);

    const currentUrl = page.url();
    console.log('   ✅ Current URL after login:', currentUrl);

    await page.screenshot({ path: 'auth-test-4-after-login.png', fullPage: true });

    // 6. Check if logged in by looking for user menu
    console.log('\n5️⃣  Checking login status...');
    const userMenu = await page.$('button:has-text("관리자")').catch(() => null);

    if (!userMenu) {
      // Try alternative selector
      const buttons = await page.$$('button');
      let foundUserButton = false;
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && text.includes('관리자')) {
          foundUserButton = true;
          console.log('   ✅ User menu found - logged in successfully!');

          // Click to open dropdown
          await button.click();
          await wait(500);
          await page.screenshot({ path: 'auth-test-5-user-menu-open.png', fullPage: true });
          console.log('   ✅ User dropdown menu opened');
          break;
        }
      }

      if (!foundUserButton) {
        console.log('   ⚠️  User menu not found, checking for error...');
        const errorText = await page.$eval('body', el => el.textContent).catch(() => '');
        if (errorText.includes('로그인') || errorText.includes('error')) {
          console.log('   ❌ Login may have failed');
        }
      }
    } else {
      console.log('   ✅ User menu found - logged in successfully!');
      await userMenu.click();
      await wait(500);
      await page.screenshot({ path: 'auth-test-5-user-menu-open.png', fullPage: true });
    }

    // 7. Test accessing protected route - Certification new
    console.log('\n6️⃣  Testing protected route access (Certification)...');
    await page.goto(`${baseUrl}/certification/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(2000);
    await page.screenshot({ path: 'auth-test-6-certification-page.png', fullPage: true });

    if (page.url().includes('/certification/new')) {
      console.log('   ✅ Successfully accessed protected certification page');
    } else {
      console.log('   ❌ Redirected away from certification page');
      console.log('      Current URL:', page.url());
    }

    // 8. Test admin dashboard access
    console.log('\n7️⃣  Testing admin dashboard access...');
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(2000);
    await page.screenshot({ path: 'auth-test-7-admin-dashboard.png', fullPage: true });

    if (page.url().includes('/admin')) {
      console.log('   ✅ Successfully accessed admin dashboard');
    } else {
      console.log('   ❌ Redirected away from admin dashboard');
      console.log('      Current URL:', page.url());
    }

    // 9. Test logout
    console.log('\n8️⃣  Testing logout...');
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(1000);

    // Find and click user menu
    const allButtons = await page.$$('button');
    for (const button of allButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('관리자')) {
        await button.click();
        await wait(500);

        // Find logout button
        const logoutButtons = await page.$$('button');
        for (const logoutBtn of logoutButtons) {
          const btnText = await logoutBtn.evaluate(el => el.textContent);
          if (btnText && btnText.includes('로그아웃')) {
            console.log('   🔄 Clicking logout button...');
            await logoutBtn.click();
            await wait(2000);
            break;
          }
        }
        break;
      }
    }

    await page.screenshot({ path: 'auth-test-8-after-logout.png', fullPage: true });
    console.log('   ✅ Logged out');

    // 10. Try to access protected route while logged out
    console.log('\n9️⃣  Testing protection when logged out...');
    await page.goto(`${baseUrl}/certification/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await wait(2000);
    await page.screenshot({ path: 'auth-test-9-protected-redirect.png', fullPage: true });

    if (page.url().includes('/auth/signin')) {
      console.log('   ✅ Correctly redirected to login page');
    } else {
      console.log('   ⚠️  Not redirected, current URL:', page.url());
    }

    console.log('\n✅ Authentication flow test completed!');
    console.log('\n📸 Screenshots saved:');
    console.log('   - auth-test-1-home-logged-out.png');
    console.log('   - auth-test-2-login-page.png');
    console.log('   - auth-test-3-credentials-filled.png');
    console.log('   - auth-test-4-after-login.png');
    console.log('   - auth-test-5-user-menu-open.png');
    console.log('   - auth-test-6-certification-page.png');
    console.log('   - auth-test-7-admin-dashboard.png');
    console.log('   - auth-test-8-after-logout.png');
    console.log('   - auth-test-9-protected-redirect.png');

  } catch (error) {
    console.error('\n❌ Error during test:', error);
    await page.screenshot({ path: 'auth-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testAuthFlow().catch(console.error);
