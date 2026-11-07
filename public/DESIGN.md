---
name: erick-brand
description: "Design principles for anything that should look like Erick's. The brand is monochrome and typographic, with text-only controls and no motion. Read the token file before building."
---

# Erick's brand

The brand is monochrome and typographic, with one voice, two typefaces, and little to no motion.

## Scope

Use this when you build a site, app, report, or one-off page that should look like it came from Erick.

This file covers the decisions. The token file has the names and values: `src/styles/tokens.css` or `https://ericc.ch/r/tokens.css`.

## Principles

- Monochrome
- Type sets the order. Size and ink intensity separate levels. Use weight only for headings and strong text.
- Controls are text. Links and buttons look the same: underlined text, no box.
- Intentionally minimal amount of tokens

## Colour

The palette is monochrome. It has surfaces and inks, nothing else. Every colour token is a `light-dark()` pair, so `color-scheme` picks the scheme.

## Typography

Order comes from size and ink intensity. Weight is for headings and strong text. Body copy stays at a comfortable reading width.

## Space

Use a small fixed grid for boxes. Text rhythm stays in `em` so it follows the reading size. Use the spacing tokens instead of arbitrary margins.

## Controls

A link is underlined text. A button looks the same: no background, no border, no padding. Focus is a visible outline. Selection uses a surface token.

## Tokens

The registry is generated from `tokens.css`.

- Plain CSS: `npx shadcn@latest add https://ericc.ch/r/tokens.json` writes `tokens.css` to the project root.
- Tailwind v4: `npx shadcn@latest add https://ericc.ch/r/tokens-theme.json` merges the same values into the project CSS.

Catalog: `https://ericc.ch/r/registry.json`. Source: `https://ericc.ch/r/tokens.css`.
