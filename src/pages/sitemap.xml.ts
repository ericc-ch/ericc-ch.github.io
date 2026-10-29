import type { APIRoute } from "astro"
import { getPublishedPosts } from "@lib/posts"
import { isoDate } from "@lib/utils"

const escape = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

/**
 * The sitemap lists exactly what the site publishes.
 *
 * It is a route rather than the integration because a draft is built at its URL and must not
 * be listed here, which the integration cannot know: it only sees a finished page.
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("https://ericc.ch")
  const posts = await getPublishedPosts()

  const newest = posts[0]?.data
  const indexDate = newest ? isoDate(newest.updatedAt ?? newest.date) : null

  const entries = [
    { loc: new URL("/", origin).href, lastmod: indexDate },
    { loc: new URL("/posts/", origin).href, lastmod: indexDate },
    ...posts.map((post) => ({
      loc: new URL(`/posts/${post.id}/`, origin).href,
      lastmod: isoDate(post.data.updatedAt ?? post.data.date),
    })),
  ]

  const urls = entries
    .map(({ loc, lastmod }) =>
      lastmod
        ? `  <url>\n    <loc>${escape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
        : `  <url>\n    <loc>${escape(loc)}</loc>\n  </url>`,
    )
    .join("\n")

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
