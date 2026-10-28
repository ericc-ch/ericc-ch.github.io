# Measure and overflow

## Status

deterministic

## Sub-features

- `--measure: 48ch` caps the text column; `.wrap` centres it
- Gutter `1.25rem` on each side is subtracted before the cap applies
- Header nav shares the same `.wrap`, so "Dark" lands on the content edge
- No horizontal scrolling at 320px

## How to get to it (user POV)

Resize from 1280 down to 320. The column shrinks with the viewport until it reaches the
cap, then stops growing on wide screens. Nothing scrolls sideways at any width.

## Driving it with Playwright

```js
const width = await page
  .locator(".wrap")
  .first()
  .evaluate((node) => node.getBoundingClientRect().width)
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
```

Measured: 562px at 1280 (48ch resolves against the 16px body), viewport minus 40px below
560px.

## Gotchas

- `scrollbar-gutter: stable` reserves 15px, so `scrollWidth - clientWidth` is **negative**
  at narrow widths. Assert `<= 0`; `=== 0` fails for the wrong reason.
- The measure is in `ch`, which is the width of `0`, not of an average character — 48ch is
  about 71 characters in Plus Jakarta Sans. Changing the family changes the rendered width
  without changing the token.
- The 1280 assertion only guards "narrower than 600px". It is not a pixel-perfect lock; a
  deliberate measure change should update the expectation.

## Promotion Criteria

A spec under `tests/e2e/layout.spec.ts` that:

- asserts `.wrap` width equals `min(viewport - 40, 48ch)` at 320, 390, 768, 1280
- asserts zero horizontal overflow at each of those widths
- asserts the nav's last item shares the right edge of `.wrap`
