# Erick's site

A monochrome, typographic personal site. One text family, no motion.

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

A handful of tokens, no accent, no hue, no state colours: the page, two surfaces, ink, muted
ink and a hairline. Adding a colour is a design decision, not a tweak.

Each token is one `light-dark()` pair, so `color-scheme` does the switching and there is no
duplicated dark block.

State never lives in colour: the toggle says "Light" or "Dark", copy says "Copied" or "Copy
failed".

Code and the favicon are the only places other colours appear. Code uses a Shiki theme chosen
for how it sits next to the page rather than for contrast; the favicon is the avatar.
Everything else is this palette.

## Typography

Plus Jakarta Sans for text, JetBrains Mono for code and dates. No second text face, no icons.

Sizes form a short fluid ladder: it gives way a little on narrow screens and reaches full size
on wide ones. Code is a fixed step below body. One line height everywhere, set once. Two
weights: regular for text, semibold for headings and `strong`.

Hierarchy comes from size and ink intensity, never from weight or decoration.

## Layout

One column, centred, capped at a readable measure. No grid system and no media queries: the
column shrinks with the viewport and stops at the cap. The narrowest phone has to fit without
sideways scrolling.

Vertical rhythm is a stack of margins. Entry rows put their metadata right with a single grid.

Boxes sit on one spacing step; every box value is a multiple of it. Text rhythm is deliberately
not on that grid — prose margins are relative to the text they separate, so they scale with the
type.

## Chrome

Links and buttons are one thing: ink text with an underline that firms up on hover. No
backgrounds, no pills, no arrows, no primary button.

Nav is Home, Posts and the theme toggle, which is a text button pushed right. Entry rows are
rows separated by whitespace, not cards and not rules. Everything is a rectangle and nothing
has a radius.

Code blocks get a caption bar with the language and a Copy button; the code itself sits on the
syntax theme's own background. Focus is an outline and is never removed.

## Structure

Layers run from tokens to page chrome: `tokens`, `base`, `prose`, `ui`. Article content is
scoped to `.prose`. The stylesheets ship without a media query or an `!important`, and the site
without a client script.

## Rules

- This file describes intent. Values live in `src/styles/`.
- Reuse a token. Changing one is a decision.
- Change state with text, not with animation.
