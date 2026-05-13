# Test Plan — SauceDemo E2E Assessment

## 1. Scope

### User journeys covered

| User | Journey covered | Rationale |
|------|----------------|-----------|
| `standard_user` | Login → Inventory → Cart → Checkout → Confirmation → Logout | Full happy-path baseline; validates core purchase funnel end-to-end |
| `locked_out_user` | Login attempt | Verifies access control; locked accounts must be blocked at the gate |
| `problem_user` | Login → Inventory (images) → Checkout form | Known broken images and form field; cross-user comparison confirms regressions are user-scoped |

### Pages in scope

- `/` — Login
- `/inventory.html` — Product listing
- `/cart.html` — Shopping cart
- `/checkout-step-one.html` — Checkout info form
- `/checkout-step-two.html` — Order overview
- `/checkout-complete.html` — Confirmation

### Browsers in scope

| Project | Engine | Viewport |
|---------|--------|----------|
| `chromium` | Playwright Chromium | 1280×720 |
| `firefox` | Gecko | 1280×720 |
| `webkit` | WebKit (Safari) | 1280×720 |
| `mobile-chrome` | Chromium | 393×851 (Pixel 5) |
| `mobile-safari` | WebKit | 390×844 (iPhone 13) |
| `google-chrome` | Branded Chrome | 1280×720 |
| `microsoft-edge` | Branded Edge | 1280×720 (CI only) |

---

## 2. Test Cases

### Core suite (`tests/*.spec.ts`) — 15 cases

| ID | Title | Priority | Type | File |
|----|-------|----------|------|------|
| TC-001 | `standard_user` logs in and lands on inventory page | P1 | Happy path | `login.spec.ts` |
| TC-002 | `locked_out_user` sees account locked error | P1 | Negative | `login.spec.ts` |
| TC-003 | Submitting empty login form shows "Username is required" | P1 | Negative | `login.spec.ts` |
| TC-004 | Correct username + wrong password shows credentials mismatch | P1 | Negative | `login.spec.ts` |
| TC-005 | Inventory page displays exactly 6 products | P2 | Happy path | `inventory.spec.ts` |
| TC-006 | Sorting by price low-to-high reorders products in ascending order | P2 | Happy path | `inventory.spec.ts` |
| TC-007 | Adding an item to cart increments the cart badge by one | P1 | Happy path | `inventory.spec.ts` |
| TC-008 | Logging out redirects to the login page | P2 | Happy path | `inventory.spec.ts` |
| TC-009 | Added item is visible in cart with its correct name | P1 | Happy path | `cart.spec.ts` |
| TC-010 | Removing item from cart empties it and clears the badge | P1 | Happy path | `cart.spec.ts` |
| TC-011 | Cart contents persist after navigating back to inventory | P2 | Edge case | `cart.spec.ts` |
| TC-012 | Full checkout flow completes and shows order confirmation | P1 | Happy path | `checkout.spec.ts` |
| TC-013 | Checkout with missing first name shows validation error | P1 | Negative | `checkout.spec.ts` |
| TC-014 | `problem_user` shows identical broken images for all products | P2 | Cross-user | `cross-user.spec.ts` |
| TC-015 | `problem_user` last name field silently discards keyboard input | P2 | Cross-user | `cross-user.spec.ts` |

**Total: 15 test cases — 15 automated** (runs across 6 browser projects locally, 7 on CI = 105 test executions per pipeline run)

### Priority definitions

- **P1** — Blocks the critical purchase path or authentication. Must pass before any release.
- **P2** — Degrades UX or reflects a functional regression. Should pass but does not block a release on its own.

---

## 3. Out of Scope

| Area | Reason for exclusion |
|------|----------------------|
| `error_user` full journey | Errors are non-deterministic per item; bugs are documented in BUG_REPORT.md (BUG-003 → BUG-006) from exploratory testing. |
| `visual_user` layout checks | Pixel-level visual regression requires a dedicated snapshot service (e.g. Percy). Findings documented in BUG_REPORT.md (BUG-007, BUG-008). |
| `performance_glitch_user` flows | Timing-dependent; flaky in CI without variable timeouts. Findings documented in BUG_REPORT.md (BUG-009). |
| Network / API-layer contract testing | App is a client-side demo with no public API contract. |
| Accessibility (a11y) | Requires specialised tooling (e.g. axe-core). Not in scope for this assessment's time budget. |
| Mobile / responsive breakpoints | Demo app is desktop-first; mobile viewports are covered by the browser project matrix, not dedicated test cases. |
| Load / stress testing | SauceDemo is a shared demo app; load testing would affect other users of the service. |

---

## 4. Risk Assessment

| Area | Risk | Likelihood | Impact | Findings |
|------|------|-----------|--------|----------|
| Login / auth flow | User-type-specific behaviour is easily misconfigured | High | Critical — gates access to all features | `locked_out_user` correctly blocked (TC-002 ✅) |
| Checkout form fields | Broken input handlers silently discard user input | High | High — blocks purchase completion | Confirmed in BUG-002 (`problem_user`) and BUG-006 (`error_user`) via exploratory testing |
| Sort / filter feature | Client-side sort logic overridden per user type | High | High — misleads users into wrong purchase decisions | Confirmed in BUG-003 (`error_user`) via exploratory testing |
| Cart add / remove | Add to Cart or Remove buttons may be non-functional | High | High — blocks the entire funnel | BUG-004 and BUG-005 confirmed for `error_user` via exploratory testing |
| Product images | Incorrect or repeated images reduce purchase confidence | Medium | Medium — UX defect, not a conversion blocker | BUG-001 confirmed: `problem_user` serves one image for all 6 products (TC-014 ✅) |
| Price formatting | Truncated prices erode trust and can cause legal/compliance issues | Medium | Medium — financial display should always be precise | BUG-007 confirmed: `$94.5` displayed instead of `$94.50` for `visual_user` |
| Layout / button bounds | Buttons outside card boundaries break tap targets on mobile | Medium | Medium — especially impactful on mobile viewports | BUG-008 confirmed for `visual_user` via exploratory testing |
| Background 401 errors | Silent auth failures on background requests can mask data loss | Medium | Medium — cart update succeeds but background sync fails | BUG-009 confirmed for `performance_glitch_user` via exploratory testing |
| Cart state pollution | `localStorage` state persists across tests if not cleared | Medium | High — causes false failures in later tests | Mitigated: each test logs in fresh and sets up its own state independently |
| CI flakiness | SauceDemo is a live demo app; downtime causes false negatives | Low | High — CI becomes unreliable | Mitigated: `retries: 2` configured in `playwright.config.ts` |

---

## 5. Bug Summary (from exploratory testing)

| Bug ID | User | Severity | Title |
|--------|------|----------|-------|
| BUG-001 | `problem_user` | High | All product images display the same broken image |
| BUG-002 | `problem_user` | High | Last name field silently discards keyboard input |
| BUG-003 | `error_user` | High | Sort dropdown has no effect on product order |
| BUG-004 | `error_user` | High | Inventory-page Remove button is unresponsive |
| BUG-005 | `error_user` | High | Not all products can be added to cart |
| BUG-006 | `error_user` | High | Last name field silently discards keyboard input |
| BUG-007 | `visual_user` | Medium | Product price missing trailing zero (`$94.5` vs `$94.50`) |
| BUG-008 | `visual_user` | Medium | Add to Cart button overflows product card boundary |
| BUG-009 | `performance_glitch_user` | Medium | Two 401 Unauthorized console errors on Add to Cart |

Full reproduction steps and evidence in `BUG_REPORT.md`.

---

## 6. How to Run Tests Locally

```bash
# Install dependencies and all browsers
npm install
npx playwright install chromium firefox webkit chrome

# Run the full suite across all 6 browser projects
npm test

# Target a single browser project
npm test -- --project=firefox
npm test -- --project=mobile-safari

# Run with browser visible (useful for debugging)
npm run test:headed

# Open interactive UI mode
npm run test:ui

# View the HTML report (all projects in one view)
npm run test:report
```
