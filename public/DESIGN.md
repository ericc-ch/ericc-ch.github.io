# Erick's brand

A monochrome, typographic brand for everything I ship. One text family, no motion.

## Overview

Whatever a surface does, it reads as a document rather than an application. Nothing moves and
nothing animates. Every control is text: a link or a text button, never a widget, and its
state is spelled out in words.

The mood is a printed essay or a well-typeset man page: quiet, monochrome, typographic. Text
is the interface, so anything that is not words needs a job: a control, a code block, or a
rule between rows.

This is the brand basis for everything I build, not just this site. The tinybrowser landing
page and a Web Platform Tests results page are the next surfaces, so these rules are meant to
survive without this content.

## Non-negotiables

- Static build. No client framework, no utility CSS.
- No third-party JavaScript. Any script is small, inline and written for that surface.
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

Code and a favicon are the only places other colours appear. A syntax theme is chosen for how
it sits next to the page rather than for contrast; a favicon is the avatar. Everything else is
this palette.

Tokens do not get retyped. The palette is published as a shadcn registry at
`ericc.ch/r/registry.json`, one theme per mode; install it with the shadcn CLI instead of
copying hex values ([registry docs](https://ui.shadcn.com/docs/registry)).

## Typography

Plus Jakarta Sans for text, JetBrains Mono for code and dates. No second text face, no icons.

Sizes form a short fluid ladder: it gives way a little on narrow screens and reaches full size
on wide ones. Code is a fixed step below body. One line height everywhere, set once. Two
weights: regular for text, semibold for headings and `strong`.

Hierarchy comes from size and ink intensity. Weight is reserved for headings and `strong`;
nothing else gets weight, colour or a box.

## Layout

One column, centred, capped at a readable measure. No grid system and no breakpoint-specific
layouts: the column shrinks with the viewport and stops at the cap. The narrowest phone has to
fit without sideways scrolling.

Vertical rhythm is a stack of margins. When rows carry metadata, one grid puts it in a single
aligned column.

Boxes sit on one spacing step; every box value is a multiple of it. Text rhythm is deliberately
not on that grid — prose margins are relative to the text they separate, so they scale with the
type.

## Chrome

Links and buttons are one thing: an underline that firms up on hover, no backgrounds, no
pills, no arrows, no primary button. A link that leaves a section sits in muted ink, so it
reads as navigation rather than as another row.

Navigation is a short row of text links, with the theme toggle pushed right. Lists are rows
separated by whitespace, not cards and not rules. Everything is a rectangle and nothing has a
radius.

Code blocks get a caption bar with the language and a Copy button; the code itself sits on the
syntax theme's own background. Focus is an outline. Only a skip link's target drops it, because
the target is the whole page.

## Structure

Styles layer from tokens outward: tokens, base, content, chrome. Content is scoped so an
article never inherits page chrome. Stylesheets ship without an `!important`, and pages
without third-party code.

Metadata is generated at build: canonical, Open Graph, a card per page, and a JSON-LD graph
naming one author and one site.

## Rules

- This file describes intent. Values live in the tokens, not here; on this site that is
  `src/styles/`.
- Reuse a token. Changing one is a decision.
- Change state with text, not with animation.
