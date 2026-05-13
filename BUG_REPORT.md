# Bug Report — SauceDemo Exploratory Testing

---

## BUG-001: All product images display the same incorrect image for `problem_user`

**Severity:** High
**User(s) affected:** `problem_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Navigate to `https://www.saucedemo.com`.
2. Log in with username `problem_user` and password `secret_sauce`.
3. Observe the product images on the inventory page.

### Expected Result

Each of the 6 products displays its own distinct product image (e.g. Sauce Labs Backpack shows a backpack, Sauce Labs Bike Light shows a bike light).

### Actual Result

All 6 products render the exact same image — a red shopping bag / dog image — regardless of which product is listed. The `src` attribute of every `<img>` element within `.inventory_item` resolves to the same URL.

### Evidence

Automated assertion in `tests/cross-user.spec.ts` — **TC-014** demonstrates this deterministically:

```
Expected: Set { <6 unique srcs> }  →  new Set(standardSrcs).size === 6  ✅
Actual:   Set { <1 src> }          →  new Set(problemSrcs).size === 1   ✅ (bug confirmed)
```

### Notes

- The defect is isolated to `problem_user`; `standard_user` displays correct images.
- Root cause hypothesis: the image `src` for `problem_user` is hard-coded to a single asset path on the server side rather than being derived from the product catalogue.
- Recommended fix: ensure the image resolver uses the product ID/slug to look up the correct asset for all user types.

---

## BUG-002: Last name field silently discards keyboard input for `problem_user`

**Severity:** High
**User(s) affected:** `problem_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `problem_user` / `secret_sauce`.
2. Add any product to the cart and navigate to the cart page.
3. Click **Checkout**.
4. On the checkout information form, click into the **Last Name** field.
5. Type any text (e.g. `Doe`).
6. Observe the field value.

### Expected Result

The Last Name input field accepts and retains the typed text, just like First Name and Postal Code.

### Actual Result

The Last Name field appears interactive (cursor visible, field focusable) but any characters typed are silently discarded. The field value remains empty (`""`). Attempting to continue to the next step fails with a "Last Name is required" validation error even after the user has typed a value.

### Evidence

Automated assertion in `tests/cross-user.spec.ts` — **TC-015**:

```
await checkoutPage.lastNameInput.fill('Doe');
const lastNameValue = await checkoutPage.lastNameInput.inputValue();

Expected: ""    // bug state — input was silently discarded
Received: ""    ✅ (confirms bug is present)
```

### Notes

- First Name and Postal Code fields are unaffected; only `[data-test="lastName"]` exhibits this behaviour.
- Root cause hypothesis: an `oninput` or `onkeydown` event handler for `problem_user` is intercepting and cancelling keystrokes before they reach the DOM value, likely as an intentional break injected into the demo app.
- Recommended fix: remove the event handler override for the last name field so it behaves like a standard `<input type="text">`.
- This defect completely blocks the checkout funnel for `problem_user` — it is unrecoverable without a page reload or workaround (e.g. copy-paste, which may or may not be intercepted).

---

## BUG-003: Sort dropdown has no effect on product order for `error_user`

**Severity:** High
**User(s) affected:** `error_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `error_user` / `secret_sauce`.
2. On the inventory page, open the sort dropdown.
3. Select **Name (Z to A)**.
4. Observe the product order.
5. Repeat with **Price (low to high)**.

### Expected Result

Products reorder according to the selected sort option.

### Actual Result

Products remain in their original A→Z order regardless of which sort option is selected. The dropdown UI updates visually but has no effect on the product list.

### Evidence

Automated assertion in `tests/smoke.spec.ts` — **SMOKE-01 / SMOKE-02**:

```
Sort Z→A selected — products still appear A→Z:
  Received: ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt", ...]
  Expected: ["Test.allTheThings() T-Shirt (Red)", "Sauce Labs Onesie", ...]
```

### Notes

- Both sort directions (Z→A and price low→high) are affected — the entire sort feature is non-functional for `error_user`.
- Root cause hypothesis: the sort event handler for `error_user` is overridden to be a no-op.
- `standard_user` sort works correctly (confirmed by TC-006).

---

## BUG-004: "Remove" button on inventory page does not respond for `error_user`

**Severity:** High
**User(s) affected:** `error_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `error_user` / `secret_sauce`.
2. Click **Add to cart** on any product — the button changes to **Remove**.
3. Click the **Remove** button.
4. Observe the cart badge and the button state.

### Expected Result

The item is removed from the cart, the badge count decreases, and the button reverts to **Add to cart**.

### Actual Result

The **Remove** button does not respond. The cart badge count stays the same and the button remains in the "Remove" state indefinitely. The action times out with no state change.

### Evidence

`tests/smoke.spec.ts` — **SMOKE-03** timed out after 5.7 s waiting for the cart badge to disappear after clicking Remove.

### Notes

- Removing items from the **cart page** works correctly for `error_user` (SMOKE-04 passes).
- Only the inventory-page Remove button is broken; the cart page Remove button is unaffected.
- This forces the user to navigate to the cart page to remove items, which is a significant UX regression.

---

## BUG-005: Not all products can be added to cart for `error_user`

**Severity:** High
**User(s) affected:** `error_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `error_user` / `secret_sauce`.
2. Attempt to click **Add to cart** for each of the 6 products in sequence.
3. Observe the cart badge after each attempt.

### Expected Result

All 6 products are added to the cart; badge shows **6**.

### Actual Result

Clicking **Add to cart** on at least one specific product does nothing — the button does not change state and the cart count does not increment. The action times out, blocking the test from completing.

### Evidence

`tests/smoke.spec.ts` — **SMOKE-06** timed out after 5.7 s; the loop iterating all 6 items stalled on a specific item's Add to Cart button.

### Notes

- The affected item could not be determined from the timeout alone; manual exploration with `error_user` is recommended to identify which specific product(s) are affected.
- This blocks a complete purchase flow for `error_user`.

---

## BUG-006: Last name field silently discards keyboard input for `error_user`

**Severity:** High
**User(s) affected:** `error_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `error_user` / `secret_sauce`.
2. Add a product to the cart and proceed to checkout.
3. Type any text into the **Last Name** field.
4. Observe the field value.

### Expected Result

The Last Name field accepts and retains the typed value.

### Actual Result

All keyboard input is silently discarded. The field value remains empty (`""`), identical to the behaviour documented in BUG-002 for `problem_user`.

### Evidence

`tests/smoke.spec.ts` — **SMOKE-05**:

```
await checkoutPage.lastNameInput.fill('Doe');
expect(await checkoutPage.lastNameInput.inputValue()).toBe('Doe');
// Received: "" — input was discarded
```

### Notes

- The same root cause as BUG-002 applies to `error_user`, indicating the broken input handler is shared between both user types.

---

## BUG-007: Product price missing trailing zero for `visual_user`

**Severity:** Medium
**User(s) affected:** `visual_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `visual_user` / `secret_sauce`.
2. Observe the price labels on the inventory page.

### Expected Result

All prices follow standard currency formatting with two decimal places (e.g. `$94.50`).

### Actual Result

The Sauce Labs Fleece Jacket displays `$94.5` — the trailing zero is missing.

### Evidence

`tests/smoke.spec.ts` — **SMOKE-08**:

```
Expected pattern: /^\$\d+\.\d{2}$/
Received string:  "$94.5"
```

### Notes

- All other prices on the page display correctly with two decimal places.
- Root cause hypothesis: the price value for this product is stored as a float (`94.5`) and rendered without explicit two-decimal formatting for `visual_user`.
- Recommended fix: apply `.toFixed(2)` or equivalent currency formatting before rendering the price.

---

## BUG-008: "Add to Cart" button overflows outside product card boundary for `visual_user`

**Severity:** Medium
**User(s) affected:** `visual_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Log in with `visual_user` / `secret_sauce`.
2. Observe the product cards on the inventory page.
3. Inspect the position of the **Add to cart** buttons relative to each card.

### Expected Result

All **Add to cart** buttons are visually contained within their respective product card boundaries.

### Actual Result

At least one **Add to cart** button extends beyond the right edge of its product card container (measured right edge: 1189 px; card right edge: 1171 px — overflow of ~18 px).

### Evidence

`tests/smoke.spec.ts` — **SMOKE-10**:

```
Expected: buttonRight (1189) <= itemRight + 1 (1171 + 1 = 1172)
Received: 1189 > 1172  ✗
```

### Notes

- Root cause hypothesis: a CSS rule for `visual_user` overrides the button width or margin, pushing it outside the card's bounding box.
- This is a layout regression that would be caught by visual diffing tools (e.g. Percy) in addition to bounding-box assertions.

---

## BUG-009: Two 401 Unauthorized console errors fire after adding to cart for `performance_glitch_user`

**Severity:** Medium
**User(s) affected:** `performance_glitch_user`
**Environment:** Chromium 136, macOS 15 (Darwin 25.4.0)

### Steps to Reproduce

1. Open browser DevTools (Console + Network tabs).
2. Log in with `performance_glitch_user` / `secret_sauce`.
3. Click **Add to cart** on any product.
4. Observe the browser console.

### Expected Result

No errors appear in the console. The cart badge increments normally.

### Actual Result

Two `401 Unauthorized` errors are logged immediately after clicking Add to cart:

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

The cart badge still updates to **1**, so the feature appears to work — but the background requests are failing silently.

### Evidence

`tests/smoke.spec.ts` — **SMOKE-12**:

```
Received array: [
  "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
  "Failed to load resource: the server responded with a status of 401 (Unauthorized)"
]
Expected length: 0
Received length: 2
```

### Notes

- The 401 errors suggest a background analytics or tracking request is being made with an invalid or missing auth token for this user type.
- While the core cart functionality still works, background 401s indicate a broken integration that could mask more serious issues or leak session state.
- `standard_user` does not produce any console errors during the same flow.
