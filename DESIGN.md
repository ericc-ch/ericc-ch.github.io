---
version: alpha
name: Erick's site
description: A monochrome, typographic personal site. One text family, six colours, no motion.
colors:
  background: "#fcfcfc"
  surface: "#f2f2f2"
  surface-raised: "#e8e8e8"
  ink: "#111111"
  ink-muted: "#575757"
  rule: "#cfcfcf"
  primary: "#111111"
typography:
  body:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  h3:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: -0.011em
  h2:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: -0.011em
  h1:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: -0.011em
  code:
    fontFamily: "JetBrains Mono"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  gutter: 20px
  section: 56px
  row: 11px
rounded:
  none: 0px
components:
  link:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  entry-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  code-block:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
---

# Overview

A personal site that should read as a page, not an application. Two routes: `/` and
`/posts/`, plus one article page per post. Nothing is interactive except links and the theme
toggle.

The mood is quiet, monochrome and typographic. Reference points are a printed essay and a
well-typeset man page, not a dashboard. The reader came to read; every element that is not
words has to earn its place.

The site is also the brand basis for two future surfaces — a tinybrowser landing page and a
Web Platform Tests results page — so the system has to survive without this site's content.

Hard constraints, all enforced by the code rather than by taste:

- Static Astro build. No client framework, no islands, no Tailwind.
- Zero third-party JavaScript. The only script is the inline theme bootstrap and its click
  handler, about 40 lines total.
- Firefox ESR 115 is the floor; an old Android phone in portrait is the test device.
- WCAG 2.2 AA everywhere, AAA for body text.
- Two themes, system default, one text button to switch.

# Colors

Six tokens, no accent, no hue. A seventh colour is a design change, not an addition.

| Token    | Light     | Dark      | Role                                 |
| -------- | --------- | --------- | ------------------------------------ |
| `--bg-0` | `#fcfcfc` | `#111111` | Page                                 |
| `--bg-1` | `#f2f2f2` | `#1a1a1a` | Caption bars, inline code, surfaces  |
| `--bg-2` | `#e8e8e8` | `#242424` | Selection, pressed rows              |
| `--fg-0` | `#111111` | `#ededed` | Body, headings, links, focus ring    |
| `--fg-1` | `#575757` | `#a3a3a3` | Dates, roles, descriptions, captions |
| `--fg-2` | `#cfcfcf` | `#333333` | Hairlines and borders                |

There is no `primary`, no success, no error. `primary` maps to ink only because the format
requires the key. State is never carried by colour: the theme button says "Light" or "Dark",
the copy button says "Copied" or "Copy failed".

Links are ink with an underline at 40% opacity, going to full opacity on hover. That
underline is the only affordance in the system — no backgrounds, no pills, no arrows.

Contrast floors, checked by `bun run contrast`:

| Pair             | Minimum | Actual (light / dark) |
| ---------------- | ------- | --------------------- |
| Body on page     | 7:1     | 18.4 / 16.1           |
| Muted on page    | 7:1     | 7.0 / 7.5             |
| Text on surface  | 7:1     | 18.4 / 16.1           |
| Hairline on page | 1.2:1   | 1.49 / 1.32           |

The dark palette is written twice in `src/styles/themes.css`: once inside
`prefers-color-scheme` for visitors without JavaScript, once on `[data-theme="dark"]` for the
toggle. They must stay identical. That duplication is the price of having no build step.

Syntax highlighting is the one place colour is allowed, and it is deliberately outside this
palette: `github-light-high-contrast` / `github-dark-high-contrast`, chosen because every
token clears 4.5:1 on our backgrounds (4.91 / 8.90). Any replacement theme must be measured
the same way before it ships.

# Typography

One text family: **Plus Jakarta Sans**, a variable font covering 200–800 in a single 28KB
file. **JetBrains Mono** for code only. No second text face, no icons.

Sizes follow Material 3 roles rather than a modular scale:

| Token         | Role                   | Size at 320 | Size at ≥1240 | Weight |
| ------------- | ---------------------- | ----------- | ------------- | ------ |
| `--text-base` | body-large             | 15.2        | 16            | 400    |
| `--text-lg`   | title-large (`h3`)     | 20.9        | 22            | 600    |
| `--text-xl`   | headline-small (`h2`)  | 22.8        | 24            | 600    |
| `--text-2xl`  | headline-medium (`h1`) | 26.6        | 28            | 600    |
| `--text-sm`   | code                   | 14          | 14            | 400    |

Every size except `--text-sm` is fluid: 5% below the ceiling at 320px, reaching the ceiling
at 1240px. All four use the same clamp shape, so the ladder keeps its proportions. The
tokens list the ceiling; the stylesheet is the source of truth.

`line-height: 1.5` everywhere, set once on `body`. Headings inherit it. Only two weights
exist: 400 for everything, 600 for headings and `strong`. Never synthesise a weight.

Headings carry `letter-spacing: -0.011em` and `text-wrap: balance`; paragraphs carry
`text-wrap: pretty`. Nothing else adjusts tracking.

Hierarchy comes from size and ink intensity, not from weight or colour. Five heading levels
exist in CSS and resolve to four sizes; `h4`–`h6` are body size.

# Layout

One container, no grid system:

```css
.wrap {
  width: min(100% - (var(--gutter) * 2), var(--measure));
  margin-inline: auto;
}
```

`--measure: 48ch`, `--gutter: 1.25rem`. `ch` is the width of `0` in Plus Jakarta Sans, which
is about 0.73em, so 48ch resolves to roughly 562px and about 71 characters per line. The
number has to be re-measured whenever the family changes; it is not a character count.

There are no media queries for layout. The column shrinks with the viewport until it hits
the measure and then stops. The only media query in the project is
`prefers-color-scheme: dark`.

Content is a stack of sections separated by `clamp()` margins. Entry rows are
`grid-template-columns: 1fr auto` so dates align on the right without pushing the title
column; that is the only grid in the system.

The narrowest supported width is 320px. Nothing may scroll sideways there.

# Elevation & Depth

No shadows, no blur, no layers. Depth is a 1px hairline in `--fg-2` plus a surface fill in
`--bg-1`.

- Section and row separators: 1px `--fg-2`, full width of the measure.
- Code blocks: 1px border, caption bar on `--bg-1`, body on `--bg-0`.
- Focus: 2px `--fg-0` outline, 2px offset, never removed.
- Selection: `color-mix(in oklab, var(--fg-0) 20%, transparent)`.

# Shapes

Everything is a rectangle. `--radius: 0`, and no element overrides it. Tags, code blocks,
the skip link and the toggle are all square. A radius would read as a different brand.

# Components

**Links and buttons share one style**: ink text, underline, no background, no padding beyond
the text, identical focus ring. There is no primary button; the theme toggle is a text
button for this reason.

**Nav**: three items in one row — Home, Posts, theme toggle. Links stay left, the toggle is
pushed right with `margin-inline-start: auto`. `aria-current="page"` marks the active
section; it is deliberately invisible.

**Entry row** (posts, work, projects): title on the left, metadata on the right in `--fg-1`,
separated from the next row by a hairline. Rows are not cards.

**Code block**: `figure.code` with a caption holding the language and a Copy button, then a
`<pre>` at 14px. The copy button reports success in its own label and through a polite live
region. On http origins, where `navigator.clipboard` does not exist, it falls back to
`document.execCommand`.

**Prose**: markdown output only. Lists, quotes, tables, figures and footnotes are styled; no
component classes are introduced for author content.

**Tags**: a square hairline chip. No post uses them today.

# Do's and Don'ts

- Do reuse an existing token. Adding a colour, size or radius token is a decision, not a
  tweak.
- Don't add animation or transitions of any kind. State changes are immediate; text changes
  are the feedback.
- Don't add client JavaScript. If something cannot work without it, it degrades: the theme
  toggle is hidden when the bootstrap does not run, and the page still reads.
- Don't add a media query for layout. Use `min()`, `clamp()` or `ch` so the layout is
  intrinsic.
- Don't introduce a second text family, an icon set, or a decorative element. Text labels
  are the interface.
- Don't carry meaning in colour alone. Every state has a text label.
- Don't let body text fall below 16px at the ceiling. The fluid floor is 15.2px at 320px;
  that is the smallest body text allowed anywhere.
- Don't ship a Shiki theme without measuring every token against the code background.
- Do run `bun run check` (contrast, typecheck, lint, format, build) before calling a change
  done, and `bun run verify` for anything touching themes, typography or layout.
- Do update `themes.css` in both dark blocks at once; the contrast script reads the
  attribute block but the media query is what no-JS visitors see.
- Do keep the registry endpoints (`/r/*.json`) in sync by reading `themes.css` rather than
  duplicating values.
