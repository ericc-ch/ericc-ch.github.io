---
name: verify-site
description: Verifies the built site in a real browser — light/dark/no-JS theme states, the toggle, code block colours and typography, measure and overflow. Use after any change to themes.css, base.css, prose.css, or Base.astro.
---

# Verify the site

The site has no E2E suite. This drives the built output in Playwright and asserts the
things that silently break: palette application, Shiki's dark colours, the toggle, and
layout at both ends.

## Launch

```sh
bun run build
bun run preview
```

`astro preview` serves `dist/`, so a build is mandatory — editing `src/` without rebuilding
verifies the previous version.

It is **single-instance**: if a preview is already running it prints
`Preview server already running at http://localhost:4321` and exits. That is not a failure;
run the doctor to confirm the live one serves the build you just made.

Ready means:

```sh
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/   # 200
```

and the page carries the toggle:

```sh
curl -s http://localhost:4321/ | grep -c 'id="theme-toggle"'       # 1
```

Stop with `bunx astro preview stop`.

## Doctor

Read-only. Run it first whenever a run fails or the build looks stale.

```sh
bunx astro preview status
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/
ls -l dist/index.html    # newer than src/styles/*.css means the build matches
```

## Drive

```sh
bun .agents/skills/verify-site/check.mjs
```

| Env            | Default                 | Meaning        |
| -------------- | ----------------------- | -------------- |
| `BASE_URL`     | `http://localhost:4321` | Preview origin |
| `CHROMIUM_BIN` | `command -v helium`     | Browser binary |

15 assertions, exit code 1 on failure. It opens a fresh context per state so
`localStorage` never leaks between light, dark, and toggled runs.

## Evidence

`.audit/evidence/`, gitignored:

- `theme-light.png`, `theme-dark.png`, `theme-dark-nojs.png`, `theme-toggle.png`
- `layout-320.png`
- `results.json` — every assertion plus the raw computed values for each state

Evidence survives cleanup; the server does not.

## Cleanup

```sh
bunx astro preview stop
```

Never kill by process name — this host also runs other Node servers.

## Helpers

`check.mjs` is executable with `bun`; it resolves the browser itself.

**Browser:** use Helium (`/etc/profiles/per-user/erickc/bin/helium`), a Chromium fork.
Playwright's bundled build does not start on this host — it fails with
`libglib-2.0.so.0: cannot open shared object file`. Chromium from nixpkgs also works via
`CHROMIUM_BIN`, but Helium is the default.

## Gotchas

- **Shiki runs with `defaultColor: false`.** Spans carry only `--shiki-light` / `--shiki-dark`,
  and `prose.css` applies them. If `defaultColor` is set back to `'light'` or removed, Shiki
  writes inline `color` again and the dark override silently loses unless it is `!important`.
  That bug shipped once: the page went dark, the code stayed light, and it looked plausible
  until `getComputedStyle` was read.
- **`scrollbar-gutter: stable`** makes `scrollWidth - clientWidth` negative at 320px
  (about `-15`). Assert `<= 0`, never `=== 0`.
- **Pick a post with a fenced code block.** `ARTICLE` in `check.mjs` points at
  `writing-my-own-shitty-version-of-executor`; a post without code has no `.astro-code span`
  and every code assertion fails for the wrong reason.
- **The no-JS state is a real state.** `javaScriptEnabled: false` with `colorScheme: 'dark'`
  is the only way to catch the palette/Shiki divergence, because with JS on the inline
  bootstrap always sets `data-theme`.
- **Fonts.** Assertions compare family names, so changing the family in `base.css` fails the
  run until `check.mjs` is updated — that is intentional.
