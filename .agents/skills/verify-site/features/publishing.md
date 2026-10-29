# Publishing

## Status

deterministic

## Sub-features

- `published: false` is built at its URL, marked `noindex, nofollow`, and left out of the home
  list, `/posts/`, `rss.xml` and `sitemap.xml`
- The OG card is still generated, because the unpublished page links to it
- `sitemap.xml` is a route, not the integration, so it can list only what is published
- Every entry in the sitemap carries a `lastmod` from `updatedAt ?? createdAt`

## How to get to it (user POV)

An unpublished post is reachable if you know the URL and invisible everywhere else. There is
no unbuilt state; publishing is listing, not building.

## Driving it with Playwright

`check.mjs` uses `/posts/kitchen-sink/` as the fixture:

```js
const sinkResponse = await sinkPage.goto(`${BASE}/posts/kitchen-sink/`)
const sink = await sinkPage.evaluate(() => ({
  robots: document.querySelector('meta[name="robots"]')?.content ?? null,
}))

const listing = await (await fetch(`${BASE}/posts/`)).text()
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
```

## Gotchas

- The fixture must stay `published: false`. Flipping it makes four assertions fail and puts
  the test bench back on the home page.
- `@astrojs/sitemap` was removed on purpose: its `filter` only sees finished URLs, so a built
  unpublished post would always be listed.
- `getPublishedPosts()` is the listing source everywhere; `getAllPosts()` is only for route
  generation and OG cards. Using the wrong one either hides a post or leaks one.
- Dates are `YYYY-MM-DD` strings, never `Date` objects, so sorting is `localeCompare` and the
  build machine's timezone cannot move a day.

## Promotion Criteria

A spec under `tests/e2e/publishing.spec.ts` that:

- asserts an unpublished page returns 200 with `noindex`
- asserts its slug is absent from `/posts/`, `rss.xml` and `sitemap.xml`
- asserts every sitemap entry has a `lastmod` and that the published set matches the content
