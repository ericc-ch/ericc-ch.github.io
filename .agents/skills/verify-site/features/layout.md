# Measure and overflow

## Status

deterministic

## Sub-features

- `--measure: 50ch` caps the text column; `.wrap` centres it
- Gutter `--space-5` on each side is subtracted before the cap applies
- Header nav shares the same `.wrap`, so "Dark" lands on the content edge
- No horizontal scrolling at 320px, body text and drafts included
- A token with no break opportunity wraps instead of stretching the column
- A table wider than the column scrolls inside its own `.table` box

## How to get to it (user POV)

Resize from 1280 down to 320. The column shrinks with the viewport until it reaches the
cap, then stops growing on wide screens. Nothing scrolls sideways at any width; a wide table
scrolls inside itself, with a focus ring when it is reached by keyboard.

## Driving it with Playwright

```js
const width = await page
  .locator(".wrap")
  .first()
  .evaluate((node) => node.getBoundingClientRect().width)
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
const tableScrolls = await page.evaluate(() => {
  const wrap = document.querySelector(".table")
  return wrap.scrollWidth > wrap.clientWidth
})
```

Measured: 585.6px at 1280 (50ch resolves against the 16px body), viewport minus the gutters
below that. The kitchen sink's four-column table is 353px inside a 265px box at 320, so the
box scrolls and the page does not.

## Gotchas

- `scrollbar-gutter: stable` reserves 15px, so `scrollWidth - clientWidth` is **negative**
  at narrow widths. Assert `<= 0`; `=== 0` fails for the wrong reason.
- The measure is in `ch`, which is the width of `0`, not of an average character — 50ch is
  about 74 characters in Plus Jakarta Sans. Changing the family changes the rendered width
  without changing the token.
- `overflow-wrap: anywhere` sits on the prose scope; `table` sets `normal`, because a table
  that breaks its words is worse than one that scrolls.
- The 1280 assertion only guards "narrower than 600px". It is not a pixel-perfect lock; a
  deliberate measure change should update the expectation.

## Promotion Criteria

A spec under `tests/e2e/layout.spec.ts` that:

- asserts `.wrap` width equals `min(viewport - 2 * gutter, 50ch)` at 320, 390, 768, 1280
- asserts zero horizontal overflow at each of those widths
- asserts the nav's last item shares the right edge of `.wrap`
- asserts a wide table scrolls in its wrapper and not in the document
