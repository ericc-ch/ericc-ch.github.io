---
title: "The Kitchen Sink"
description: "Every block and inline element this site renders, on one page, including the ones it still gets wrong."
date: "Oct 27 2026"
updatedAt: "Oct 29 2026"
tags: ["meta", "design", "test"]
draft: false
---

This page exists to be looked at rather than read. It renders every block and inline element
the site supports, in one place, so a stylesheet change shows up here before it shows up in a
real post.

It is also honest about the parts that are wrong. Each section ends with what to look at, and
the last one lists what is still broken.

## Type

Body text is set at the base size with one line height. Here is **strong**, *emphasis*,
***both at once***, `inline code`, a [link to somewhere else](https://example.com), a very long
inline token `npm_config_registry=https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`
that has no space to break at, and a line with <kbd>Cmd</kbd> + <kbd>K</kbd>,
<abbr title="Cascading Style Sheets">CSS</abbr>, <mark>marked text</mark>, H<sub>2</sub>O,
x<sup>2</sup>, and <small>small print</small> in it.

Look at: the italic is synthesised by the browser because only the normal weight is loaded, the
`mark` is the only colour on the site, the `kbd` has no styling at all, and the long inline code
runs past the column instead of breaking.

### The ladder

Headings come from a short ladder. This is the third level.

#### Fourth level

A paragraph under a fourth-level heading.

##### Fifth level

A paragraph under a fifth-level heading.

###### Sixth level

A paragraph under a sixth-level heading.

Look at: the fourth, fifth and sixth levels are all body size. Only weight separates them, which
is the one thing the design says hierarchy never comes from.

#### A heading directly after another block

The rule that removes a heading's top margin when something sits above it is here.

## Lists

- One item, long enough to wrap onto a second line so the hanging indent is visible and the
  bullet stays out of the way.
- A second item.
  - A nested item.
  - Another nested item, with `inline code` in it.
- A third item.

1. Ordered lists renumber themselves from the first number written.
2. So this is two.
3. And this is three, with a nested list:
   1. Nested one.
   2. Nested two.

A list can start somewhere else:

3. This one starts at three.
4. Because that is what was written.
5. Markdown keeps it.

- [ ] An unchecked task.
- [x] A checked task.

Look at: the task checkboxes are native inputs, so the accent colour is the browser's, not the
palette.

## Quotes

> A quote with **bold** inside it, and a list, because blockquotes can hold blocks.
>
> - One.
> - Two.
>
> And a second paragraph, so the quote has two of them.

> > A quote inside a quote gets the same rule twice, which reads as a thicker line.

Look at: the quote rule is one hairline and the ink drops one step. Nested, it doubles.

## Code

Inline code uses a chip: `const answer = 42`.

A fenced block with a language:

```typescript
const posts = await getPublishedPosts()

export async function getStaticPaths() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }))
}
```

A block with a line too long for the column, so it scrolls sideways:

```json
{
  "name": "welcome-to-the-kitchen-sink-and-thank-you-for-reading-all-of-this-because-the-line-is-long-on-purpose",
  "version": "1.0.0",
  "description": "A very long string so the pre has to scroll, which is the only place on the site that scrolls sideways."
}
```

A block with no language, so the caption falls back to the plain one:

```
no language here
```

Look at: tab to a block and the focus ring is drawn around the whole figure, not the code. The
caption is fixed at the small step while inline code is relative to the text, so the two drift
apart on a narrow screen.

## Tables

| Element | Styled by | What it gets | What it does not get |
| --- | --- | --- | --- |
| Table | `prose.css` | A hairline under every row, left-aligned cells | A scroll container, so a wide table pushes the page sideways |
| Header cell | `prose.css` | Semibold and muted ink | Anything that survives at body size |
| Task list | nothing | The browser's checkbox | The palette |
| Image | `prose.css` | `max-width: 100%` | A caption, because Markdown images are not figures |

Look at: every column is read from a real table cell above. Shrink the window to 320 and the
table takes the page with it.

## Media

<img src="/favicon.svg" alt="The site's favicon, a geometric fox" width="96" height="96">

Look at: an image is a paragraph with an image in it. There is no caption, and no `figure`
around it, so the figure styles only ever apply to code blocks. Markdown's `![alt](src)` makes
the same bare image; this one is raw HTML only so it can be given a width.

## Links

A link in a sentence is [underlined and firms up on hover](/posts/). A link on its own line
looks like this:

[Every post](/posts/)

A link to a heading is [The ladder](#the-ladder), a link to an address is
[email](mailto:erickchristian48@gmail.com), and a footnote is one too.[^first]

Look at: the standalone link and the inline link are the same thing, because they are. Only
"All posts" and "Back to posts" get the muted treatment, and they are outside this article.

## Details

<details>
<summary>Open this for a list</summary>

- A list inside a disclosure.
- Which is just a list.

</details>

Look at: a plain `<details>` gets nothing from the stylesheet. The summary is not muted, the
triangle is the browser's, and the marker is the only icon on the site.

## Footnotes

A footnote reference sits in the text,[^first] and another one points at a different note.[^second]

[^first]: The first note, with `code` in it.

[^second]: The second note. Footnotes are set apart by a rule and one step of muted ink.

Look at: the reference loses its underline, the note list is muted, and the rule above it is the
same hairline as everything else.

## What this page proves

Everything below is visible somewhere above. It is listed here so the next change has a target.

1. The fourth, fifth and sixth heading levels are all body size, so weight is their whole
   hierarchy. Table headers are the same trick.
2. Italic is synthesised. The text family ships in one style.
3. `<mark>` paints the browser's yellow. It is the only colour on the site, and the palette has
   no token to replace it with.
4. Task-list checkboxes and the disclosure triangle are the browser's, in its colour, with its
   icon.
5. A table wider than the column, and an inline token with no break opportunity, both push the
   page sideways. Nothing in `prose.css` wraps or scrolls them.
6. Inline code is `0.875em`; a code block is a fixed `0.875rem`. They are the same size at
   16px and different at 320.
7. An image is a paragraph, so there is no caption and no figure.
8. A raw `<details>` takes no block margin at all, because the rhythm only knows the Markdown
   blocks in its list.
9. The tags above the title have no vertical padding. This is the first post to use them, so
   nothing had caught it.
10. The date above the title is not part of the link, so clicking it does nothing. That is a
    deliberate change: the date used to be inside the link and carried its underline.

The rest of the page is the page: one column, one measure, one line height, two themes, no
media queries, no third-party script.
