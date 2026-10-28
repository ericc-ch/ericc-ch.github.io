# Code block colours and type

## Status

deterministic

## Sub-features

- Dual Shiki themes: `vitesse-light` inline, `vitesse-dark` as `--shiki-dark`
- Dark override applied on `[data-theme="dark"]` and in `prefers-color-scheme` with `!important`
- Code and caption at `--text-sm` (14px), JetBrains Mono
- Copy button with a language label in `figure.code > figcaption`
- Background forced to `--bg-1` over Shiki's own inline background

## How to get to it (user POV)

Open any post containing a fenced block, for example
`/posts/writing-my-own-shitty-version-of-executor/`. The block shows a header row with the
language and a **Copy** button, then the code.

## Driving it with Playwright

```js
const span = page.locator(".astro-code span", { hasText: "Page Snapshot" })
const color = await span.evaluate((node) => getComputedStyle(node).color)
const pre = page.locator(".code pre")
const size = await pre.evaluate((node) => getComputedStyle(node).fontSize) // 14px
const family = await pre.evaluate((node) => getComputedStyle(node).fontFamily)
```

Contrast is computed in the driver from the resolved `color` and the `pre` background.

## Gotchas

- **Shiki writes `style="color:#..."` on every span.** A stylesheet override without
  `!important` silently loses. The symptom is subtle: the page goes dark, the code stays
  light, and it still looks readable enough to pass a glance. Reading the computed colour
  is the only reliable check.
- Each token carries both palettes inline: `color:#B56959;--shiki-dark:#C98A7D`. Picking a
  span by its attribute string can match a low-alpha punctuation token
  (`#B5695977`) — select by text content instead.
- `vitesse-light` is tuned for a white background. On `--bg-1` (`#f2f2f2`) some tokens fall
  below 4.5:1; the string token measures 3.66:1. This is a real gap, not a driver bug.
- The `pre` background comes from our CSS with `!important`, not from Shiki; Shiki's
  `--shiki-dark-bg` is unused.

## Promotion Criteria

A spec under `tests/e2e/code-block.spec.ts` that:

- asserts light and dark token colours against expected `rgb()` values
- asserts a contrast floor of 4.5:1 for every token, not just one
- asserts `font-size: 14px` and `JetBrains Mono` on `pre` and `figcaption`
- clicks Copy and asserts the clipboard text matches the block
