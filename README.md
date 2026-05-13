# Psynth — QA Engineer Take-Home Assessment

## Welcome

Thank you for your interest in the QA Engineer role at **Psynth**! This take-home assessment is designed to evaluate your hands-on skills in E2E test automation, CI/CD integration, test planning, and bug reporting.

**Estimated time:** 2–3 hours
**Deadline:** Please submit within **5 calendar days** of receiving this assignment.

---

## Target Application

You will write tests against **SauceDemo**, an open demo e-commerce app by Sauce Labs:

🔗 **https://www.saucedemo.com**

### Available Credentials

| Username                  | Description                         |
| ------------------------- | ----------------------------------- |
| `standard_user`           | Normal user — all features work     |
| `locked_out_user`         | Locked out — login should fail      |
| `problem_user`            | Broken images and form behavior     |
| `performance_glitch_user` | Simulated slow responses            |
| `error_user`              | Triggers various application errors |
| `visual_user`             | Visual/layout inconsistencies       |

**Password for all users:** `secret_sauce`

Take a few minutes to explore the app manually before you start writing tests.

---

## Assessment Structure

This assessment has **4 parts**. All parts are required unless marked as bonus.

### Part 1 — Test Plan (document)

Create a file called `TEST_PLAN.md` in the root of this repo. It must include:

1. **Scope:** Which user journeys and pages you chose to cover, and why.
2. **Test cases:** A prioritized list of test cases (at least **10**) covering:
   - Happy-path flows (login → browse → cart → checkout)
   - Negative/edge cases (invalid login, empty cart, missing form fields)
   - At least one cross-user scenario (e.g., `problem_user` vs. `standard_user`)
3. **Out of scope:** What you intentionally excluded and why (given the 2–3 hr constraint).
4. **Risk assessment:** Which areas of the app are most likely to break and why.

### Part 2 — E2E Test Automation (code)

Implement automated tests for **at least 6** of the test cases from your test plan.

#### Requirements

- **Framework:** Use **Cypress** or **Playwright** (your choice).
- **Language:** JavaScript or TypeScript.
- **Structure:** Tests must be organized in the `tests/` directory (or framework default like `cypress/e2e/`). Use page objects or a similar abstraction pattern — do **not** put all selectors inline.
- **Test independence:** Each test must be runnable independently (no reliance on test execution order).
- **Assertions:** Use meaningful assertions — not just "page loaded" checks.
- **Data cleanup:** Tests should handle their own setup/teardown where needed.

#### What we look for

- Clean, readable, and maintainable test code.
- Proper use of selectors (prefer `data-test` attributes where available over brittle CSS/XPath).
- Sensible waits and retry strategies (no hard-coded `sleep` / `wait` calls).
- Clear test naming that describes the behavior being verified.

### Part 3 — CI/CD Integration (GitHub Actions)

Set up a GitHub Actions workflow so that your tests run automatically.

#### Requirements

- Create or complete the workflow file at `.github/workflows/e2e-tests.yml`.
- The workflow must:
  - Trigger on **push** to `main` and on **pull requests**.
  - Install dependencies and run the full test suite.
  - Upload test results/reports as **artifacts** (screenshots on failure, HTML report, or video — whatever your framework supports).
- A starter workflow file is provided as a reference — you may modify or replace it entirely.

#### What we look for

- A working pipeline that passes when tests pass and fails when tests fail.
- Proper caching of dependencies for faster runs.
- Artifact uploads so we can review test results without cloning the repo.

### Part 4 — Bug Report

While exploring the app (especially with `problem_user` or `error_user`), you will encounter bugs.

Create a file called `BUG_REPORT.md` with **at least 2 bug reports**. Each report must follow this format:

```
## Bug Title

**Severity:** Critical / High / Medium / Low
**User(s) affected:** (which test user)
**Environment:** Browser, OS

### Steps to Reproduce
1. Step one
2. Step two
3. ...

### Expected Result
What should happen.

### Actual Result
What actually happens.

### Evidence
Screenshot or test output (paste inline or link to a file in the repo).

### Notes
Any additional context, root cause hypothesis, or recommended fix.
```

---

## Repo Setup

### Getting Started

1. **Clone or download** this repository.
2. Initialize your framework of choice:

   **Cypress:**

   ```bash
   npm init -y
   npm install -D cypress
   npx cypress open   # to scaffold folders
   ```

   **Playwright:**

   ```bash
   npm init -y
   npm install -D @playwright/test
   npx playwright install
   ```

3. Write your tests in the `tests/` folder (Playwright) or `cypress/e2e/` folder (Cypress).
4. Push your work to a **personal GitHub repository** and invite sbpsynth as a collaborator.

### Provided Files

| File                              | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `README.md`                       | This file — your instructions              |
| `.github/workflows/e2e-tests.yml` | Starter CI workflow (modify as needed)     |
| `tests/.gitkeep`                  | Placeholder for your test files            |
| `.gitignore`                      | Standard ignores for node_modules, reports |

---

## Submission Checklist

Before submitting, make sure you have:

- [ ] `TEST_PLAN.md` with at least 10 prioritized test cases
- [ ] At least 6 automated E2E tests that pass against SauceDemo
- [ ] Page object or similar abstraction pattern used
- [ ] Tests are independent and use no hard-coded waits
- [ ] `.github/workflows/e2e-tests.yml` runs tests on push/PR
- [ ] CI artifacts uploaded (screenshots, reports, or videos)
- [ ] `BUG_REPORT.md` with at least 2 detailed bug reports
- [ ] All code is clean, commented, and well-organized
- [ ] `README` or notes explaining how to run tests locally

---

## Evaluation Criteria

| Area              | Weight |
| ----------------- | ------ |
| Test plan quality | 20%    |
| Automation code   | 35%    |
| CI/CD integration | 20%    |
| Bug reports       | 15%    |
| Code style & docs | 10%    |

---

## Important Notes

- You are free to use any npm packages, plugins, or utilities you find helpful.
- If you run into issues with the demo app being down, document it and test what you can.
- We value **quality over quantity** — 6 solid tests beat 20 flaky ones.
- If anything is unclear, reply to the email that sent you this assignment.

Good luck! We look forward to reviewing your work. 🚀

---

## Running This Test Suite

### Prerequisites

- Node.js 20+
- macOS / Linux / Windows (WSL recommended on Windows)

### Setup

```bash
# Install dependencies
npm install

# Install all browser engines
npx playwright install chromium firefox webkit chrome
```

### Run tests

```bash
# Full suite — all browsers (chromium, firefox, webkit, mobile-chrome, mobile-safari, google-chrome)
npm test

# Single browser
npm test -- --project=firefox
npm test -- --project=mobile-safari

# Headed mode (browser visible)
npm run test:headed

# Interactive UI mode
npm run test:ui

# Open the HTML report from the last run
npm run test:report
```

### Project structure

```
tests/
├── pages/               # Page Object Model classes
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── helpers/
│   └── auth.ts          # Shared login helper and credentials
├── login.spec.ts        # TC-001 – TC-004  (login flows)
├── inventory.spec.ts    # TC-005 – TC-008  (browsing, sort, cart badge)
├── cart.spec.ts         # TC-009 – TC-011  (cart management)
├── checkout.spec.ts     # TC-012 – TC-013  (checkout flow)
└── cross-user.spec.ts   # TC-014 – TC-015  (problem_user bugs)
playwright.config.ts     # Browser projects, reporters, base URL
TEST_PLAN.md             # 15 prioritized test cases + risk assessment
BUG_REPORT.md            # 9 bug reports with reproduction steps
```

### CI pipeline

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) triggers on every push and pull request to `main`. It:

- Caches npm packages and Playwright browser binaries
- Runs all 7 browser projects (including Microsoft Edge, CI-only)
- Uploads the HTML report and JUnit results as artifacts
- Deploys the live HTML report to GitHub Pages

**Live report:** https://maximilianoisea.github.io/qa-assesment/
