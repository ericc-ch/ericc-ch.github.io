# Theme states and the toggle

## Status

deterministic

## Sub-features

- One palette of `light-dark(light, dark)` tokens; `color-scheme` picks the half
- `:root` is `color-scheme: light dark`, so the system decides with no media query
- `[data-theme="light"]` / `[data-theme="dark"]` pin `color-scheme` after the bootstrap or the toggle
- Toggle sets `data-theme`, persists to `localStorage`, and relabels itself
- The toggle is hidden when JS never runs

## How to get to it (user POV)

Open any page. The header shows **Home · Posts · Dark**; "Dark" is the toggle. Click it and
the page turns dark, the label becomes "Light", and the choice survives a reload.

A first-time visitor with no stored choice follows the operating system. A visitor with JS
disabled sees no toggle and still gets the system palette.

## Driving it with Playwright

```sh
bun run build && bun run preview
bun .agents/skills/verify-site/check.mjs
```

The driver opens four contexts against the same article:

```js
await page.emulateMedia({ colorScheme: "dark" }) // or newContext({ colorScheme })
await browser.newContext({ colorScheme: "dark", javaScriptEnabled: false })
await page.click("#theme-toggle")
```

Assertions: `html[data-theme]`, `body` background, `getComputedStyle` of a known text token,
and the toggle's text content.

## Gotchas

- With JS on, the inline bootstrap **always** sets `data-theme`, even for the system
  default, so the loaded page never relies on `:root`'s `light dark`. The no-JS case is the
  only one that exercises the system default.
- `light-dark()` needs `color-scheme`; if that property is ever removed from `:root`, every
  palette token becomes invalid and the page renders with inherited colours.
- Persistence uses `localStorage.theme` with values `light` or `dark` only; there is no
  stored `system` value. Clearing it returns the visitor to the system default.
- A fresh Playwright context has empty storage, so each state must get its own context or
  the toggle leaks into the next run.

## Promotion Criteria

A spec under `tests/e2e/theme.spec.ts` that:

- builds the site as setup, serves it on an ephemeral port
- asserts all four states above with `getComputedStyle`, not screenshots
- asserts the toggle label flips both ways and survives `page.reload()`
- asserts `#theme-toggle` is absent with `javaScriptEnabled: false`
