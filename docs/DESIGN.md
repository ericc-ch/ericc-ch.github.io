# Erick's site

A monochrome, typographic personal site. One text family, six colours, no motion.

## Overview

It reads as a page, not an application. Nothing moves, nothing animates, nothing is behind a
control except the theme toggle.

The mood is a printed essay or a well-typeset man page: quiet, monochrome, typographic. Text
is the interface, so every element that is not words has to earn its place.

It is also the brand basis for two future surfaces — a tinybrowser landing page and a Web
Platform Tests results page — so these rules are meant to survive without this content.

## Non-negotiables

- Static build. No client framework, no utility CSS.
- No third-party JavaScript. The only script is the inline theme bootstrap and its toggle.
- Modern browsers only. No polyfills; a missing feature has to degrade to something readable.
- WCAG 2.2 AA, AAA for body text. Syntax highlighting is the one recorded exception.
- Two themes from the system preference, one text button to switch.

## Colour

Six tokens, no accent, no hue, no state colours. Background, two surfaces, ink, muted ink and
a hairline. A seventh colour is a design decision, not an addition.

Each token is one `light-dark()` pair, so `color-scheme` does the switching and there is no
duplicated dark block.

State never lives in colour: the toggle says "Light" or "Dark", copy says "Copied" or "Copy
failed".

Code is the one place other colours appear — a Shiki theme chosen for how it sits next to the
page rather than for contrast. Code is texture, not body copy.

## Typography

Plus Jakarta Sans for text, JetBrains Mono for code and dates. No second text face, no icons.

Four fluid sizes: 16 body, 22 `h3`, 24 `h2`, 28 `h1`, with 14 fixed for code. The ladder is
5% smaller at 320px and reaches full size at 1240px. `line-height: 1.5` everywhere, set once.
Two weights only: 400, and 600 for headings and `strong`.

Hierarchy comes from size and ink intensity, never from weight or decoration.

## Layout

One column, `min(100% - 2 * gutter, 48ch)`, centred. No grid system and no media queries: the
column shrinks until it reaches the measure and then stops. 320px is the floor, and nothing
may scroll sideways there.

Vertical rhythm is a stack of `clamp()` margins. Entry rows put their metadata right with a
single `1fr auto` grid.

## Chrome

Links and buttons are one thing: ink text with an underline that firms up on hover. No
backgrounds, no pills, no arrows, no primary button.

Nav is Home, Posts and the theme toggle, which is a text button pushed right. Entry rows are
hairline-separated rows, not cards. Everything is a rectangle and nothing has a radius.

Code blocks get a caption bar with the language and a Copy button; the code itself sits on the
syntax theme's own background. Focus is a 2px outline and is never removed.

## Structure

Four cascade layers, in order: `tokens`, `base`, `prose`, `ui`. Article content is scoped with
`@scope (.prose)`. The stylesheets ship without a media query or an `!important`, and the site
without a client script.

## Rules

- This file is intent, not a copy. Token values, ratios and checks live in `src/styles/` and
  the scripts.
- Reuse a token. Adding a colour, size or radius is a decision, not a tweak.
- Change state with text, not with animation.
