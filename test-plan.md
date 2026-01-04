# K-Glow Platform - Playwright Test Plan

## Overview
This test plan covers comprehensive end-to-end testing for the K-Glow B2B platform, which helps Korean cosmetics brands enter the Russian/CIS market.

**Test Environment**: http://localhost:3003
**Test Framework**: Playwright
**Last Updated**: 2026-01-03

---

## Test Suite 1: Homepage & Navigation

### Test 1.1: Homepage Load and Structure
**Priority**: High
**Steps**:
1. Navigate to http://localhost:3003
2. Wait for page to fully load
3. Verify page title contains "K-Glow"
4. Verify main navigation menu is visible
5. Check for hero section
6. Verify footer is present

**Expected Results**:
- Page loads within 3 seconds
- All sections are visible
- No console errors

### Test 1.2: Navigation Menu Functionality
**Priority**: High
**Steps**:
1. Navigate to homepage
2. Locate main navigation menu
3. Click on each menu item (Calculator, Analyze, Partners, Certification)
4. Verify each page loads correctly
5. Check that navigation highlights the active page

**Expected Results**:
- All navigation links work
- Pages load without errors
- Active menu item is highlighted

### Test 1.3: Mobile Responsive Navigation
**Priority**: Medium
**Steps**:
1. Set viewport to mobile size (375x667)
2. Navigate to homepage
3. Verify hamburger menu appears
4. Click hamburger menu
5. Verify navigation menu opens
6. Test all navigation links on mobile

**Expected Results**:
- Mobile menu toggles correctly
- All links accessible on mobile
- UI adapts to mobile viewport

---

## Test Suite 2: Quote Calculator (/calculator)

### Test 2.1: Calculator Page Load
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Verify page title
3. Check for calculator form sections
4. Verify all input fields are present

**Expected Results**:
- Calculator form loads successfully
- All required fields visible
- Exchange rate displayed

### Test 2.2: Exchange Rate Display
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Locate exchange rate section
3. Verify KRW to RUB rate is displayed
4. Verify RUB to KRW rate is displayed
5. Check last updated timestamp

**Expected Results**:
- Exchange rates are numeric values
- Timestamp shows recent update
- Rates are reasonable (positive numbers)

### Test 2.3: Product Input - Valid Data
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Enter product name: "수분 크림"
3. Enter quantity: 100
4. Enter price (KRW): 30000
5. Enter weight: 0.2
6. Enter volume: 0.0005
7. Click calculate or submit button

**Expected Results**:
- All fields accept input
- Form validates successfully
- Calculation results displayed

### Test 2.4: Product Input - Invalid Data
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Enter negative quantity: -10
3. Attempt to submit
4. Enter zero price: 0
5. Attempt to submit
6. Leave required fields empty
7. Attempt to submit

**Expected Results**:
- Validation errors displayed
- Form prevents submission
- Error messages are clear and helpful

### Test 2.5: Shipping Method Selection
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Locate shipping method options
3. Select "항공 (Air)" option
4. Verify shipping cost updates
5. Select "해상 (Sea)" option
6. Verify shipping cost changes

**Expected Results**:
- Both shipping methods selectable
- Costs update dynamically
- Sea shipping cheaper than air

### Test 2.6: Certification Type Selection
**Priority**: Medium
**Steps**:
1. Navigate to /calculator
2. Find certification options
3. Select EAC certification
4. Verify cost added to total
5. Select GOST certification
6. Verify different cost applied

**Expected Results**:
- Certification options available
- Costs accurately calculated
- Total updates correctly

### Test 2.7: Tax Calculations
**Priority**: High
**Steps**:
1. Navigate to /calculator
2. Enter product details with known values
3. Submit calculation
4. Verify customs duty (6.5%) calculated
5. Verify VAT (20%) calculated
6. Check total includes all taxes

**Expected Results**:
- Customs duty = product cost × 6.5%
- VAT = (product cost + duty) × 20%
- Math is accurate

### Test 2.8: Quote Result Display
**Priority**: High
**Steps**:
1. Complete full quote calculation
2. Verify results section appears
3. Check KRW amounts displayed
4. Check RUB amounts displayed
5. Verify breakdown of costs shown

**Expected Results**:
- Results clearly formatted
- Both currencies shown
- Itemized cost breakdown visible

### Test 2.9: Multiple Products Calculation
**Priority**: Medium
**Steps**:
1. Navigate to /calculator
2. Add first product
3. Click "Add Product" button (if available)
4. Add second product with different details
5. Calculate total quote

**Expected Results**:
- Multiple products can be added
- Each product calculated separately
- Total combines all products

---

## Test Suite 3: Brand Website Analysis (/analyze)

### Test 3.1: Analysis Page Load
**Priority**: High
**Steps**:
1. Navigate to /analyze
2. Verify page loads
3. Check for URL input field
4. Verify analysis options present

**Expected Results**:
- Page loads without errors
- Input form is accessible
- Instructions are clear

### Test 3.2: Website URL Input - Valid URL
**Priority**: High
**Steps**:
1. Navigate to /analyze
2. Enter valid Korean cosmetics website URL
3. Select max depth: 2
4. Check "Save to database" option
5. Click "Analyze" button

**Expected Results**:
- Form accepts URL
- Analysis starts
- Loading indicator appears

### Test 3.3: Website URL Input - Invalid URL
**Priority**: High
**Steps**:
1. Navigate to /analyze
2. Enter invalid URL: "not-a-url"
3. Attempt to submit
4. Enter URL without protocol: "example.com"
5. Attempt to submit

**Expected Results**:
- Validation error for invalid URL
- Clear error messages
- Form doesn't submit with invalid data

### Test 3.4: Analysis Progress Indication
**Priority**: Medium
**Steps**:
1. Navigate to /analyze
2. Submit valid website URL
3. Observe loading states
4. Check for progress indicators
5. Wait for completion

**Expected Results**:
- Loading spinner or progress bar shown
- User knows analysis is in progress
- No timeout errors for long analysis

### Test 3.5: Analysis Results Display
**Priority**: High
**Steps**:
1. Complete website analysis
2. Verify results section appears
3. Check for extracted product information
4. Verify Russian translations shown
5. Check market fit score (0-100)

**Expected Results**:
- Product details extracted
- Russian translations displayed
- Market fit score is numeric
- Results are well-formatted

### Test 3.6: Analysis Results - Product Images
**Priority**: Medium
**Steps**:
1. Complete analysis with image-rich website
2. Verify product images displayed
3. Check image loading
4. Verify image quality

**Expected Results**:
- Images load successfully
- Images have alt text
- Broken image icons handled

### Test 3.7: Save to Database Functionality
**Priority**: Medium
**Steps**:
1. Analyze website with "Save to DB" checked
2. Complete analysis
3. Navigate to /partners
4. Verify new partner appears in list

**Expected Results**:
- Data saved successfully
- Partner visible in database
- All details transferred correctly

### Test 3.8: Analysis Error Handling
**Priority**: High
**Steps**:
1. Navigate to /analyze
2. Enter URL of non-existent website
3. Submit analysis
4. Observe error handling
5. Try unreachable website URL

**Expected Results**:
- Graceful error messages
- No application crash
- User can retry with different URL

---

## Test Suite 4: Partners Page (/partners)

### Test 4.1: Partners List Load
**Priority**: High
**Steps**:
1. Navigate to /partners
2. Verify page loads
3. Check for partners list/grid
4. Count number of partners displayed

**Expected Results**:
- Page loads successfully
- Partners displayed in organized layout
- At least sample data visible

### Test 4.2: Partner Card Display
**Priority**: Medium
**Steps**:
1. Navigate to /partners
2. Locate first partner card
3. Verify brand name displayed
4. Check for website URL
5. Verify market fit score shown
6. Check for product count

**Expected Results**:
- All partner details visible
- Cards uniformly formatted
- Information is accurate

### Test 4.3: Partner Detail Navigation
**Priority**: High
**Steps**:
1. Navigate to /partners
2. Click on a partner card
3. Verify navigation to detail page
4. Check URL contains partner ID

**Expected Results**:
- Detail page opens
- URL format: /partners/[id]
- Page shows full partner information

### Test 4.4: Partner Detail Page Content
**Priority**: High
**Steps**:
1. Navigate to partner detail page
2. Verify brand name and logo
3. Check website link
4. Verify product list
5. Check Russian translations
6. Verify market analysis

**Expected Results**:
- All partner data displayed
- Products listed with details
- Translations visible
- Analysis metrics shown

### Test 4.5: Partner Search/Filter
**Priority**: Medium
**Steps**:
1. Navigate to /partners
2. Locate search or filter input
3. Enter search term
4. Verify results filtered
5. Clear search
6. Verify all partners shown again

**Expected Results**:
- Search works in real-time
- Results match search criteria
- Clear button restores full list

### Test 4.6: Partners Pagination
**Priority**: Low
**Steps**:
1. Navigate to /partners (if many partners exist)
2. Check for pagination controls
3. Click next page
4. Verify new partners loaded
5. Click previous page

**Expected Results**:
- Pagination controls visible
- Page changes work
- Correct number per page

### Test 4.7: Empty Partners State
**Priority**: Low
**Steps**:
1. Clear all partners from database
2. Navigate to /partners
3. Verify empty state message
4. Check for "Add Partner" CTA

**Expected Results**:
- Friendly empty state message
- Guidance on adding first partner
- No errors displayed

---

## Test Suite 5: Certification Application (/certification)

### Test 5.1: New Certification Page Load
**Priority**: High
**Steps**:
1. Navigate to /certification/new
2. Verify page loads
3. Check for application form
4. Verify all form sections present

**Expected Results**:
- Form loads successfully
- All required fields visible
- Instructions clear

### Test 5.2: Partner Selection
**Priority**: High
**Steps**:
1. Navigate to /certification/new
2. Locate partner selection dropdown
3. Open dropdown
4. Verify partners list populated
5. Select a partner

**Expected Results**:
- Dropdown contains partners
- Partner selection works
- Selected partner displayed

### Test 5.3: Product Information Input
**Priority**: High
**Steps**:
1. On /certification/new
2. Select partner
3. Enter product name
4. Enter product category
5. Enter ingredients/composition
6. Upload product image (if available)

**Expected Results**:
- All fields accept input
- File upload works
- Data persists in form

### Test 5.4: Certification Type Selection
**Priority**: High
**Steps**:
1. On certification form
2. Locate certification type options
3. Select EAC option
4. Verify EAC-specific fields appear
5. Change to GOST option
6. Verify different fields appear

**Expected Results**:
- Both certification types available
- Dynamic form fields based on type
- All required info collectible

### Test 5.5: Document Upload
**Priority**: High
**Steps**:
1. On certification form
2. Find document upload section
3. Click upload button
4. Select PDF file
5. Verify file uploaded
6. Try uploading invalid file type

**Expected Results**:
- Valid files upload successfully
- File name displayed after upload
- Invalid files rejected with message

### Test 5.6: Form Validation
**Priority**: High
**Steps**:
1. On /certification/new
2. Leave required fields empty
3. Attempt to submit
4. Verify validation errors
5. Fill one field at a time
6. Check errors clear appropriately

**Expected Results**:
- Required field validation works
- Error messages are specific
- Errors clear when fields filled

### Test 5.7: Certification Application Submission
**Priority**: High
**Steps**:
1. Complete all form fields
2. Upload required documents
3. Click submit button
4. Verify submission success
5. Check redirect to status page

**Expected Results**:
- Form submits successfully
- Success message displayed
- Redirected to application status

### Test 5.8: Certification Status Page Load
**Priority**: High
**Steps**:
1. Navigate to /certification/status
2. Verify page loads
3. Check for applications list
4. Verify status indicators present

**Expected Results**:
- Status page accessible
- Applications listed
- Status clearly indicated

### Test 5.9: Application Status Display
**Priority**: High
**Steps**:
1. On /certification/status
2. Locate submitted application
3. Verify application ID shown
4. Check partner name displayed
5. Verify certification type shown
6. Check status badge (pending/approved/rejected)
7. Verify submission date

**Expected Results**:
- All application details visible
- Status is clear and accurate
- Date formatting correct

### Test 5.10: Application Detail View
**Priority**: Medium
**Steps**:
1. On /certification/status
2. Click on an application
3. Verify detail modal/page opens
4. Check all submitted information visible
5. Verify uploaded documents accessible

**Expected Results**:
- Full application details shown
- Documents can be viewed/downloaded
- All data matches submission

### Test 5.11: Application Status Filter
**Priority**: Medium
**Steps**:
1. On /certification/status
2. Locate status filter (if available)
3. Filter by "Pending"
4. Verify only pending shown
5. Filter by "Approved"
6. Verify only approved shown

**Expected Results**:
- Filter works correctly
- Results update dynamically
- All statuses filterable

---

## Test Suite 6: Admin Features

### Test 6.1: Admin Page Access
**Priority**: High
**Steps**:
1. Navigate to /admin (if exists)
2. Verify access control
3. Check for login requirement
4. Test with admin credentials

**Expected Results**:
- Admin page requires authentication
- Unauthorized users redirected
- Admin users can access

### Test 6.2: Application Status Management
**Priority**: High
**Steps**:
1. Login as admin
2. Navigate to application list
3. Click on pending application
4. Change status to "Approved"
5. Save changes
6. Verify status updated

**Expected Results**:
- Admin can change status
- Changes save successfully
- User sees updated status

### Test 6.3: Partner Data Management
**Priority**: Medium
**Steps**:
1. Login as admin
2. Navigate to partners management
3. Edit partner information
4. Save changes
5. Verify updates reflected

**Expected Results**:
- Partner data editable
- Changes persist
- No data loss

---

## Test Suite 7: Cross-Browser & Responsive

### Test 7.1: Chrome Desktop
**Priority**: High
**Steps**:
1. Open application in Chrome
2. Test all major features
3. Verify UI renders correctly
4. Check for console errors

**Expected Results**:
- Full functionality works
- No browser-specific issues

### Test 7.2: Firefox Desktop
**Priority**: Medium
**Steps**:
1. Open application in Firefox
2. Test navigation and forms
3. Verify calculator works
4. Check responsive behavior

**Expected Results**:
- Compatible with Firefox
- All features functional

### Test 7.3: Mobile Safari (iPhone)
**Priority**: High
**Steps**:
1. Set viewport to iPhone 13 (390x844)
2. Test navigation menu
3. Fill out calculator form
4. Test touch interactions

**Expected Results**:
- Mobile layout works
- Forms usable on mobile
- Touch targets adequate

### Test 7.4: Tablet Layout (iPad)
**Priority**: Medium
**Steps**:
1. Set viewport to iPad (768x1024)
2. Navigate all pages
3. Verify layout adapts
4. Test portrait and landscape

**Expected Results**:
- Tablet layout optimized
- All content accessible
- Both orientations work

### Test 7.5: Small Mobile (320px)
**Priority**: Low
**Steps**:
1. Set viewport to 320x568
2. Navigate key pages
3. Verify text readable
4. Check no horizontal scroll

**Expected Results**:
- Content fits viewport
- Text remains legible
- UI doesn't break

---

## Test Suite 8: Performance & Loading

### Test 8.1: Page Load Performance
**Priority**: High
**Steps**:
1. Clear cache
2. Navigate to homepage
3. Measure load time
4. Check Core Web Vitals (LCP, FID, CLS)

**Expected Results**:
- Page loads < 3 seconds
- LCP < 2.5s
- CLS < 0.1

### Test 8.2: API Response Times
**Priority**: Medium
**Steps**:
1. Monitor network tab
2. Perform quote calculation
3. Check API response time
4. Analyze website
5. Check analysis API time

**Expected Results**:
- Calculator API < 500ms
- Analysis API appropriate for task
- No timeout errors

### Test 8.3: Image Optimization
**Priority**: Medium
**Steps**:
1. Navigate to partners page
2. Check Network tab
3. Verify image sizes
4. Check image formats (WebP preferred)

**Expected Results**:
- Images properly sized
- Modern formats used
- Lazy loading implemented

### Test 8.4: Concurrent User Handling
**Priority**: Low
**Steps**:
1. Simulate 10 concurrent users
2. All perform calculations
3. Monitor server response
4. Check for degradation

**Expected Results**:
- Server handles concurrent requests
- No significant slowdown
- No errors

---

## Test Suite 9: Data Validation & Security

### Test 9.1: SQL Injection Prevention
**Priority**: High
**Steps**:
1. Navigate to search/filter inputs
2. Enter SQL injection payloads
3. Submit forms
4. Verify no SQL errors
5. Check database not affected

**Expected Results**:
- Input sanitized
- No SQL injection possible
- Error handling graceful

### Test 9.2: XSS Prevention
**Priority**: High
**Steps**:
1. Enter script tags in text fields
2. Submit forms
3. Verify scripts don't execute
4. Check HTML encoding

**Expected Results**:
- Scripts don't execute
- Output properly escaped
- No XSS vulnerabilities

### Test 9.3: File Upload Security
**Priority**: High
**Steps**:
1. Try uploading executable files
2. Try uploading oversized files
3. Try uploading malicious files
4. Verify all rejected appropriately

**Expected Results**:
- Only allowed file types accepted
- File size limits enforced
- Malicious files blocked

### Test 9.4: Rate Limiting
**Priority**: Medium
**Steps**:
1. Submit analysis requests rapidly
2. Monitor for rate limiting
3. Verify appropriate throttling

**Expected Results**:
- Rate limiting in place
- Clear error messages
- Prevents abuse

---

## Test Suite 10: Internationalization & Localization

### Test 10.1: Korean Language Display
**Priority**: High
**Steps**:
1. Navigate all pages
2. Verify Korean text displays correctly
3. Check for encoding issues
4. Verify no garbled characters

**Expected Results**:
- Korean characters render properly
- UTF-8 encoding correct
- No display issues

### Test 10.2: Russian Language Display
**Priority**: High
**Steps**:
1. View translated content
2. Verify Cyrillic characters
3. Check translation quality
4. Verify special characters

**Expected Results**:
- Russian text displays correctly
- Translations accurate
- No encoding problems

### Test 10.3: Currency Formatting
**Priority**: High
**Steps**:
1. View calculator results
2. Verify KRW formatting (₩)
3. Verify RUB formatting (₽)
4. Check number formatting (commas/spaces)

**Expected Results**:
- Currencies properly formatted
- Symbols display correctly
- Number format matches locale

### Test 10.4: Date/Time Formatting
**Priority**: Medium
**Steps**:
1. Check timestamps on applications
2. Verify date format
3. Check timezone handling

**Expected Results**:
- Dates formatted consistently
- Timezone correct
- Clear date presentation

---

## Test Suite 11: Error Handling & Edge Cases

### Test 11.1: Network Error Handling
**Priority**: High
**Steps**:
1. Disconnect network
2. Try to submit forms
3. Verify error messages
4. Reconnect network
5. Retry operations

**Expected Results**:
- Clear network error messages
- No application crash
- Retry functionality available

### Test 11.2: API Failure Handling
**Priority**: High
**Steps**:
1. Force API to fail (mock)
2. Attempt calculator operation
3. Verify graceful degradation
4. Check user feedback

**Expected Results**:
- Error message displayed
- Application remains functional
- Helpful error messages

### Test 11.3: Exchange Rate API Unavailable
**Priority**: Medium
**Steps**:
1. Simulate exchange rate API failure
2. Navigate to calculator
3. Verify fallback rate used
4. Check user notification

**Expected Results**:
- Fallback to default rate
- User informed of static rate
- Calculator still functional

### Test 11.4: Database Connection Error
**Priority**: High
**Steps**:
1. Simulate database unavailability
2. Try to load partners
3. Verify error handling
4. Check for data loss prevention

**Expected Results**:
- Graceful error message
- No data corruption
- Clear user communication

### Test 11.5: Session Timeout
**Priority**: Medium
**Steps**:
1. Login (if applicable)
2. Wait for session timeout
3. Try to perform action
4. Verify redirect to login

**Expected Results**:
- Session timeout works
- User redirected appropriately
- No data loss

---

## Test Suite 12: Accessibility (A11y)

### Test 12.1: Keyboard Navigation
**Priority**: High
**Steps**:
1. Navigate site using only keyboard
2. Tab through all interactive elements
3. Use Enter/Space to activate
4. Verify focus indicators visible

**Expected Results**:
- All elements keyboard accessible
- Tab order logical
- Focus clearly visible

### Test 12.2: Screen Reader Compatibility
**Priority**: High
**Steps**:
1. Enable screen reader (NVDA/JAWS)
2. Navigate homepage
3. Fill out calculator form
4. Verify all content announced

**Expected Results**:
- All content accessible
- Form labels properly associated
- ARIA labels where needed

### Test 12.3: Color Contrast
**Priority**: Medium
**Steps**:
1. Check text/background contrast
2. Use contrast checker tool
3. Verify WCAG AA compliance
4. Check error messages

**Expected Results**:
- Contrast ratio ≥ 4.5:1 for normal text
- Contrast ratio ≥ 3:1 for large text
- Error messages high contrast

### Test 12.4: Form Labels and Instructions
**Priority**: High
**Steps**:
1. Review all forms
2. Verify every field has label
3. Check for helpful instructions
4. Verify error messages clear

**Expected Results**:
- All fields properly labeled
- Instructions available
- Error messages descriptive

### Test 12.5: Alt Text for Images
**Priority**: Medium
**Steps**:
1. Check all images
2. Verify alt text present
3. Ensure alt text descriptive
4. Check decorative images marked

**Expected Results**:
- All functional images have alt text
- Alt text is meaningful
- Decorative images have empty alt

---

## Test Suite 13: Data Persistence & State Management

### Test 13.1: Form Data Persistence
**Priority**: Medium
**Steps**:
1. Fill out half of calculator form
2. Navigate away
3. Return to calculator
4. Verify data retained (if implemented)

**Expected Results**:
- Form data persists (or clear warning)
- No unexpected data loss
- User experience smooth

### Test 13.2: Local Storage Usage
**Priority**: Low
**Steps**:
1. Perform various actions
2. Check browser local storage
3. Verify appropriate data stored
4. Clear storage and verify impact

**Expected Results**:
- Only necessary data stored
- No sensitive data in local storage
- App handles cleared storage

### Test 13.3: Session Consistency
**Priority**: Medium
**Steps**:
1. Open app in multiple tabs
2. Perform actions in tab 1
3. Switch to tab 2
4. Verify state synchronized (if applicable)

**Expected Results**:
- Consistent behavior across tabs
- No conflicting states
- Data integrity maintained

---

## Test Suite 14: Integration Testing

### Test 14.1: End-to-End User Journey - Quote Creation
**Priority**: Critical
**Steps**:
1. Navigate to homepage
2. Click calculator link
3. Fill out complete product quote
4. Select shipping method
5. Choose certification type
6. View results
7. Verify accuracy

**Expected Results**:
- Complete flow works seamlessly
- All calculations accurate
- User can complete task

### Test 14.2: End-to-End User Journey - Brand Analysis to Partner
**Priority**: Critical
**Steps**:
1. Navigate to /analyze
2. Enter Korean cosmetics website URL
3. Enable "Save to database"
4. Submit analysis
5. Wait for completion
6. Navigate to /partners
7. Verify new partner appears
8. Click partner for details
9. Verify all analyzed data present

**Expected Results**:
- Complete flow from analysis to partner listing
- Data transfers correctly
- All features integrated properly

### Test 14.3: End-to-End User Journey - Certification Application
**Priority**: Critical
**Steps**:
1. Navigate to /certification/new
2. Select existing partner
3. Fill certification form
4. Upload documents
5. Submit application
6. Navigate to /certification/status
7. Verify application listed
8. Check application status

**Expected Results**:
- Full certification workflow works
- Application tracked properly
- Status updates correctly

### Test 14.4: Data Flow - Calculator to Certification
**Priority**: Medium
**Steps**:
1. Calculate quote for products
2. Note products and costs
3. Start certification application
4. Verify quote data can inform application
5. Complete certification for quoted products

**Expected Results**:
- Data can flow between features
- User journey is smooth
- No duplicate data entry needed

---

## Test Suite 15: Content & Copy Verification

### Test 15.1: Homepage Content
**Priority**: Medium
**Steps**:
1. Review homepage text
2. Verify company description accurate
3. Check for typos
4. Verify calls-to-action clear

**Expected Results**:
- Professional copy
- No spelling/grammar errors
- Clear value proposition

### Test 15.2: Error Messages Quality
**Priority**: Medium
**Steps**:
1. Trigger various error states
2. Review error message text
3. Verify messages helpful
4. Check tone is friendly

**Expected Results**:
- Error messages guide user
- Tone is helpful, not blame-oriented
- Next steps clear

### Test 15.3: Help Text and Tooltips
**Priority**: Low
**Steps**:
1. Hover over info icons
2. Review tooltip text
3. Verify help text accurate
4. Check for consistency

**Expected Results**:
- Help text is helpful
- Tooltips provide value
- Consistent terminology

---

## Regression Testing Checklist

After any code changes, run these critical tests:

- [ ] Homepage loads without errors
- [ ] Navigation menu works on all pages
- [ ] Calculator produces accurate results
- [ ] Website analysis completes successfully
- [ ] Partners list displays correctly
- [ ] Certification form submits properly
- [ ] All forms validate correctly
- [ ] Mobile responsive layout intact
- [ ] No console errors
- [ ] Database operations successful

---

## Test Execution Priority

### P0 (Critical - Must Pass):
- All form submissions
- Calculator accuracy
- Navigation functionality
- Data persistence
- Security tests

### P1 (High - Should Pass):
- UI/UX consistency
- Error handling
- Mobile responsiveness
- Accessibility basics
- Performance benchmarks

### P2 (Medium - Nice to Have):
- Advanced filters
- Admin features
- Pagination
- Advanced accessibility
- Edge cases

### P3 (Low - Optional):
- Empty states
- Tooltips
- Minor UI refinements
- Advanced performance optimization

---

## Test Data Requirements

### Sample Korean Cosmetics Websites:
- Create test partners with varied data
- Include products with different price ranges
- Various certification statuses

### Test Users:
- Regular user account
- Admin user account
- Invalid credentials for negative testing

### File Uploads:
- Valid PDF documents (< 5MB)
- Invalid file types (.exe, .zip)
- Oversized files (> 10MB)
- Corrupted files

---

## Known Limitations & Future Tests

1. Authentication system not yet implemented - tests prepared for future
2. Admin panel may be under development - tests outlined
3. Real-time exchange rate API may have rate limits
4. Some features marked as "준비 중" (in preparation)

---

## Test Report Template

For each test execution:
- Test ID
- Date executed
- Tester name
- Browser/Device
- Pass/Fail status
- Screenshots (if failed)
- Steps to reproduce issues
- Severity of failures

---

## Automation Notes

**Recommended for automation:**
- Regression tests (post-deployment)
- Calculator accuracy tests
- Form validation tests
- Navigation tests
- API integration tests

**Recommended for manual testing:**
- Visual design checks
- Usability assessment
- Exploratory testing
- Translation quality
- Admin workflows

---

**Test Plan Version**: 1.0
**Created**: 2026-01-03
**Next Review**: After major feature releases
