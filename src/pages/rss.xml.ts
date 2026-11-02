import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { SITE } from "@consts"
import { getPublishedPosts } from "@lib/posts"

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts()

  return rss({
    title: SITE.NAME,
    description: SITE.DESCRIPTION,
    site: context.site ?? "https://ericc.ch",
    customData: "<language>en</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(`${post.data.createdAt}T00:00:00Z`),
      link: `/posts/${post.id}/`,
    })),
  })
}
