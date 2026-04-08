# Testing Checklist for Amazon Smart Analyzer

This document outlines all manual testing procedures for the Amazon Smart Analyzer Chrome extension.

## Pre-Testing Setup

- [ ] Chrome browser installed (latest version recommended)
- [ ] Valid Google Gemini API key obtained from https://aistudio.google.com/app/apikey
- [ ] Extension loaded in Chrome via `chrome://extensions` (Developer mode enabled, "Load unpacked")
- [ ] DevTools available for console monitoring

---

## Test 1: Fresh Installation & Initial Configuration

**Objective:** Verify clean installation process and API key setup

### Steps:
1. [ ] Navigate to `chrome://extensions`
2. [ ] Enable Developer mode (toggle in top-right)
3. [ ] Click "Load unpacked"
4. [ ] Select the `amazon-smart-analyzer` folder
5. [ ] Verify extension appears in extension list
6. [ ] Verify extension icon appears in Chrome toolbar
7. [ ] Click extension icon in toolbar
8. [ ] Verify popup opens with API key input field
9. [ ] Paste valid Gemini API key
10. [ ] Click "Save API Key"
11. [ ] Verify success message appears
12. [ ] Close and reopen popup
13. [ ] Verify API key persists (shown in input field)

**Expected Results:**
- Extension loads without errors
- Popup UI displays correctly
- API key saves successfully to Chrome storage
- API key persists after closing/reopening popup

---

## Test 2: Product Page Detection

**Objective:** Verify button appears only on valid product pages

### Test 2.1: Valid Product Pages
1. [ ] Navigate to amazon.com homepage
2. [ ] Verify button does NOT appear
3. [ ] Navigate to amazon.com search results page
4. [ ] Verify button does NOT appear
5. [ ] Navigate to a product page (e.g., any laptop listing)
6. [ ] Verify "Analyze with AI" button appears near price
7. [ ] Verify button positioning is appropriate (not overlapping content)
8. [ ] Verify button styling is clean and visible

**Expected Results:**
- Button appears ONLY on product pages
- Button does not appear on: homepage, search results, cart, checkout
- Button is visually clear and accessible

### Test 2.2: URL Pattern Matching
Test on different product URL formats:
1. [ ] Standard product URL: `/dp/[ASIN]`
2. [ ] Product URL with extras: `/dp/[ASIN]/ref=...`
3. [ ] Mobile-style URL: `/gp/product/[ASIN]`
4. [ ] Product URL with query parameters

**Expected Results:**
- Button appears on all valid product URL patterns

---

## Test 3: Full Analysis Flow (End-to-End)

**Objective:** Test complete user journey from button click to results display

### Steps:
1. [ ] Navigate to a product page with many reviews (100+)
2. [ ] Open DevTools Console (F12)
3. [ ] Click "Analyze with AI" button
4. [ ] Verify button changes to "Analyzing..." state
5. [ ] Verify button shows loading spinner/animation
6. [ ] Verify button is disabled during analysis
7. [ ] Wait for analysis to complete (10-30 seconds)
8. [ ] Verify results panel appears below button
9. [ ] Verify verdict badge displays (Good Deal/Fair/Overpriced)
10. [ ] Verify verdict badge has appropriate color (green/yellow/red)
11. [ ] Verify "Pros" section populated with bullet points
12. [ ] Verify "Cons" section populated with bullet points
13. [ ] Verify "Price Assessment" section displays analysis
14. [ ] Verify close button (X) appears in results panel
15. [ ] Click close button
16. [ ] Verify results panel disappears
17. [ ] Verify button returns to "Analyze with AI" state

**Expected Results:**
- Complete flow works smoothly without errors
- Results are comprehensive and well-formatted
- UI transitions are smooth
- Close functionality works correctly

---

## Test 4: Re-Analysis on Same Page

**Objective:** Verify extension handles multiple analyses on same product

### Steps:
1. [ ] Complete one full analysis (Test 3)
2. [ ] Close the results panel
3. [ ] Click "Analyze with AI" button again
4. [ ] Verify analysis runs again
5. [ ] Verify new results display
6. [ ] Compare results to previous analysis (should be similar but may vary slightly)

**Expected Results:**
- Can run multiple analyses on same page
- Each analysis is independent
- No memory leaks or performance degradation

---

## Test 5: Page Navigation & Button Persistence

**Objective:** Verify button behavior across page navigation

### Steps:
1. [ ] Navigate to Product A
2. [ ] Verify button appears
3. [ ] Click analyze and complete analysis
4. [ ] Navigate to Product B (different product)
5. [ ] Verify button re-appears on new page
6. [ ] Verify previous results are NOT shown
7. [ ] Click analyze on Product B
8. [ ] Verify new analysis runs for Product B
9. [ ] Navigate back to Product A (browser back button)
10. [ ] Verify button re-appears
11. [ ] Verify previous results are NOT automatically shown

**Expected Results:**
- Button appears fresh on each product page
- State doesn't leak between different products
- Each product gets independent analysis

---

## Test 6: Multiple Amazon Domains

**Objective:** Verify extension works across different Amazon regional sites

### Test on each domain:

#### 6.1: amazon.com (US)
1. [ ] Navigate to any product on amazon.com
2. [ ] Verify button appears
3. [ ] Click analyze
4. [ ] Verify results display correctly

#### 6.2: amazon.co.uk (UK)
1. [ ] Navigate to any product on amazon.co.uk
2. [ ] Verify button appears
3. [ ] Click analyze
4. [ ] Verify results display correctly

#### 6.3: amazon.in (India)
1. [ ] Navigate to any product on amazon.in
2. [ ] Verify button appears
3. [ ] Click analyze
4. [ ] Verify results display correctly

#### 6.4: Optional - Test other domains
- [ ] amazon.de (Germany)
- [ ] amazon.ca (Canada)
- [ ] amazon.fr (France)
- [ ] amazon.es (Spain)
- [ ] amazon.it (Italy)
- [ ] amazon.co.jp (Japan)

**Expected Results:**
- Extension works identically on all supported domains
- No domain-specific bugs or issues
- Button placement consistent across domains

---

## Test 7: Different Product Types

**Objective:** Verify extension handles various product categories gracefully

### 7.1: Electronics
1. [ ] Test on laptop product
2. [ ] Test on smartphone product
3. [ ] Verify detailed specs are captured
4. [ ] Verify analysis is relevant to electronics

### 7.2: Books
1. [ ] Test on a book product
2. [ ] Verify analysis mentions author, reviews, ratings
3. [ ] Verify price assessment appropriate for books

### 7.3: Clothing
1. [ ] Test on clothing item
2. [ ] Verify analysis mentions size, material, reviews
3. [ ] Verify handles size variations

### 7.4: Home Goods
1. [ ] Test on furniture or home appliance
2. [ ] Verify analysis is contextually appropriate

### 7.5: Edge Cases
1. [ ] **High-review product (500+ reviews)**
   - [ ] Verify analysis completes successfully
   - [ ] Verify analysis incorporates review insights

2. [ ] **Low-review product (< 10 reviews)**
   - [ ] Verify analysis completes
   - [ ] Verify analysis notes limited review data

3. [ ] **New product (0 reviews)**
   - [ ] Verify button appears
   - [ ] Click analyze
   - [ ] Verify graceful handling (may show error or limited analysis)

**Expected Results:**
- Extension handles all product types
- Analysis is contextually relevant to each category
- Gracefully handles edge cases (few reviews, no reviews)

---

## Test 8: Performance Testing

**Objective:** Ensure extension doesn't negatively impact browser performance

### 8.1: Page Load Performance
1. [ ] Open DevTools Performance tab
2. [ ] Navigate to a product page
3. [ ] Check page load time
4. [ ] Verify page loads normally (no significant delay)
5. [ ] Check for any performance warnings

### 8.2: Analysis Performance
1. [ ] Open DevTools Performance tab
2. [ ] Click "Record" in Performance tab
3. [ ] Click "Analyze with AI" button
4. [ ] Wait for analysis to complete
5. [ ] Stop recording
6. [ ] Review performance profile:
   - [ ] No long tasks blocking main thread
   - [ ] Page remains responsive during analysis
   - [ ] No excessive memory usage
7. [ ] Verify analysis completes in < 30 seconds

### 8.3: Memory Leak Check
1. [ ] Open DevTools Memory tab
2. [ ] Take heap snapshot
3. [ ] Run 5-10 analyses on different products
4. [ ] Take another heap snapshot
5. [ ] Compare snapshots
6. [ ] Verify no significant memory growth

**Expected Results:**
- Page loads quickly with extension installed
- Browser remains responsive during analysis
- No memory leaks detected
- Analysis completes within reasonable time

---

## Test 9: Browser Console Check

**Objective:** Verify clean console output with no errors

### Steps:
1. [ ] Open DevTools Console (F12)
2. [ ] Clear console
3. [ ] Navigate to a product page
4. [ ] Observe console output
5. [ ] Click "Analyze with AI" button
6. [ ] Observe console during analysis
7. [ ] Wait for results to display
8. [ ] Review final console state

### Check for:
- [ ] **No error messages** (red text)
- [ ] **No warning messages** (yellow text)
- [ ] **Only expected info logs** (if any)
- [ ] No failed network requests
- [ ] No CORS errors
- [ ] No permission errors

**Expected Results:**
- Clean console with no errors
- Only informational logs (if logging implemented)
- No unexpected warnings

---

## Test 10: Error Handling

**Objective:** Verify graceful error handling for various failure scenarios

### 10.1: Invalid API Key
1. [ ] Open extension popup
2. [ ] Enter invalid API key (random string)
3. [ ] Save API key
4. [ ] Navigate to product page
5. [ ] Click "Analyze with AI"
6. [ ] Verify error message displays
7. [ ] Verify error message is user-friendly
8. [ ] Verify button returns to clickable state

### 10.2: No API Key
1. [ ] Remove API key from extension storage (reinstall extension)
2. [ ] Navigate to product page
3. [ ] Click button (if it appears)
4. [ ] Verify appropriate error message

### 10.3: Network Failure
1. [ ] Disconnect internet
2. [ ] Click "Analyze with AI"
3. [ ] Verify error message about network issue
4. [ ] Reconnect internet
5. [ ] Retry analysis
6. [ ] Verify successful analysis

### 10.4: API Rate Limit
1. [ ] Click analyze on 15+ products rapidly (within 1 minute)
2. [ ] Verify rate limit error message appears
3. [ ] Wait 1 minute
4. [ ] Retry analysis
5. [ ] Verify analysis succeeds

**Expected Results:**
- All errors handled gracefully
- User-friendly error messages
- Clear instructions for resolution
- Extension doesn't crash or become unresponsive

---

## Test 11: UI/UX Testing

**Objective:** Verify visual quality and user experience

### 11.1: Button Appearance
- [ ] Button text is readable
- [ ] Button color contrasts with background
- [ ] Button size is appropriate (not too small/large)
- [ ] Button doesn't overlap other page elements
- [ ] Loading animation is smooth

### 11.2: Results Panel
- [ ] Panel is visually appealing
- [ ] Text is readable (font size, color)
- [ ] Sections are clearly separated
- [ ] Verdict badge is prominent
- [ ] Colors are appropriate (green=good, red=bad)
- [ ] Close button is easy to find
- [ ] Panel doesn't obscure important product info

### 11.3: Responsive Design
1. [ ] Resize browser window to various sizes
2. [ ] Verify button remains visible and clickable
3. [ ] Verify results panel adapts to width
4. [ ] Test on different zoom levels (80%, 100%, 125%)

**Expected Results:**
- Clean, professional appearance
- Good readability
- Responsive to different window sizes
- Consistent with Amazon's visual style (non-intrusive)

---

## Test 12: Accessibility Testing

**Objective:** Ensure extension is accessible

### Steps:
1. [ ] Tab through page elements
2. [ ] Verify "Analyze with AI" button is focusable via keyboard
3. [ ] Press Enter when button focused
4. [ ] Verify analysis starts
5. [ ] Tab to close button in results
6. [ ] Press Enter to close results
7. [ ] Verify color contrast is sufficient (WCAG AA)
8. [ ] Test with screen reader (if available)

**Expected Results:**
- Full keyboard navigation support
- Sufficient color contrast
- Screen reader compatible (if tested)

---

## Test 13: Security & Privacy

**Objective:** Verify security and privacy compliance

### 13.1: API Key Storage
1. [ ] Save API key
2. [ ] Open Chrome DevTools > Application > Storage
3. [ ] Navigate to Extensions > Local Storage
4. [ ] Verify API key is stored in chrome.storage.local (not visible in DevTools)

### 13.2: Network Requests
1. [ ] Open DevTools Network tab
2. [ ] Click analyze
3. [ ] Review network requests
4. [ ] Verify only Gemini API requests are made
5. [ ] Verify no data sent to third-party servers
6. [ ] Verify no tracking or analytics requests

### 13.3: Permissions
1. [ ] Check manifest.json permissions
2. [ ] Verify only necessary permissions requested:
   - [ ] storage (for API key)
   - [ ] activeTab (for product page access)
   - [ ] host_permissions (only Amazon domains)

**Expected Results:**
- API key stored securely
- No unnecessary network requests
- Minimal permissions requested
- No data leakage

---

## Test 14: Cross-Browser Compatibility

**Objective:** Verify extension works on Chrome variants

### Test on:
1. [ ] Google Chrome (latest)
2. [ ] Microsoft Edge (Chromium-based)
3. [ ] Brave Browser (optional)

**Expected Results:**
- Extension works on all Chromium-based browsers

---

## Final Verification Checklist

Before considering testing complete:

- [ ] All core functionality tests passed (Tests 1-5)
- [ ] Multi-domain testing completed (Test 6)
- [ ] Various product types tested (Test 7)
- [ ] Performance verified acceptable (Test 8)
- [ ] Console is clean with no errors (Test 9)
- [ ] Error handling works correctly (Test 10)
- [ ] UI/UX is polished (Test 11)
- [ ] Security checks passed (Test 13)
- [ ] No critical bugs found
- [ ] Extension ready for production use

---

## Bug Reporting Template

If you find any issues during testing, document them using this format:

```
**Bug Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Environment:**
- Chrome Version:
- Extension Version: 1.0.0
- OS:
- Amazon Domain:

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Console Errors (if any):**

**Screenshots:**
```

---

## Testing Sign-off

**Tester Name:** ___________________

**Date:** ___________________

**Overall Status:** ☐ PASS  ☐ PASS WITH MINOR ISSUES  ☐ FAIL

**Notes:**

---

## Quick Smoke Test (5 minutes)

For rapid verification after code changes:

1. [ ] Load extension in Chrome
2. [ ] Configure API key
3. [ ] Navigate to amazon.com product
4. [ ] Click analyze button
5. [ ] Verify results display
6. [ ] Check console for errors
7. [ ] Test close button
8. [ ] Test on one more product

If all 8 steps pass, core functionality is working.
