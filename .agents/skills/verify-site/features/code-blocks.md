# Code block colours and type

## Status

deterministic

## Sub-features

- Dual Shiki themes: `github-light-high-contrast` and `github-dark-high-contrast`
- `defaultColor: false`, so spans carry `--shiki-light` / `--shiki-dark` and no inline `color`
- `prose.css` applies the variables for light, `[data-theme="dark"]`, and `prefers-color-scheme`
- Code and caption at `--text-sm` (14px), JetBrains Mono
- Copy button with a language label in `figure.code > figcaption`
- Copy feedback: label flips to "Copied" (or "Copy failed") for 2s, `#copy-status` announces it
- Clipboard falls back to `document.execCommand` on http origins, where `navigator.clipboard` is absent
- Background on `--bg-0`, painted by our CSS rather than by Shiki

## How to get to it (user POV)

Open any post containing a fenced block, for example
`/posts/writing-my-own-shitty-version-of-executor/`. The block shows a header row with the
language and a **Copy** button, then the code.

## Driving it with Playwright

```js
const light = await page.evaluate(() => {
  const spans = [...document.querySelectorAll(".astro-code span")]
  const target = spans.find(
    (span) => span.textContent.trim() && span.style.getPropertyValue("--shiki-light"),
  )
  return {
    computed: getComputedStyle(target).color,
    light: getComputedStyle(target).getPropertyValue("--shiki-light"),
    dark: getComputedStyle(target).getPropertyValue("--shiki-dark"),
  }
})
const pre = page.locator(".code pre")
const size = await pre.evaluate((node) => getComputedStyle(node).fontSize) // 14px
const family = await pre.evaluate((node) => getComputedStyle(node).fontFamily)
```

Contrast is computed over **every** token, compositing alpha onto the `pre` background, and
the minimum is asserted. Measured on the current themes: **4.91:1** light, **8.90:1** dark.

## Gotchas

- **Shiki is configured with `defaultColor: false`.** Nothing writes inline `color`, so
  `prose.css` owns the palette and no rule needs `!important`. Setting `defaultColor` back to
  `'light'` (the Shiki default) reintroduces inline colours, and any dark override then loses
  silently — that bug shipped once and looked fine on screen.
- **Do not select a token by its text.** Shiki's tokenizer boundary depends on the theme —
  `vitesse` split `"Page Snapshot"` into a quote span plus the text, `github-*` keeps the
  quotes in one token. Select the first span that has text and `--shiki-light`.
- **`.astro-code span` also matches `.line` wrappers**, which have no colour variables. Require
  `--shiki-light` or the checks read an inherited value.
- **Alpha matters.** Punctuation tokens carry alpha (`#B5695977`). Composite the alpha onto
  the background before computing contrast, or the ratio is wrong.
- **Light themes are tuned for white.** On our background, only
  `github-light-high-contrast` cleared 4.5:1 across every token; `vitesse-light` bottomed
  out at 3.66:1 on `--bg-1` and 4.09:1 even on white. Swapping the pair was the fix, not a
  tweak to the background.
- The `pre` background comes from our CSS with `!important`, not from Shiki; Shiki's
  `--shiki-dark-bg` is unused.
- **`navigator.clipboard` does not exist on http origins.** Over the Tailscale IP the click
  handler used to throw `Cannot read properties of undefined (reading 'writeText')` and give
  no feedback at all. The `execCommand` fallback is what makes the button work there; do not
  remove it as "legacy".
- Clipboard reads in the driver need `permissions: ["clipboard-read", "clipboard-write"]`
  and a secure origin. Against the IP the assertion degrades to "not readable" rather than
  failing the run.

## Promotion Criteria

A spec under `tests/e2e/code-block.spec.ts` that:

- asserts light and dark token colours against expected `rgb()` values
- asserts a contrast floor of 4.5:1 for every token, not just one
- asserts `font-size: 14px` and `JetBrains Mono` on `pre` and `figcaption`
- clicks Copy and asserts the clipboard text matches the block
