import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import type { APIContext } from "astro"
import { SITE } from "@consts"

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((first, second) => second.data.date.valueOf() - first.data.date.valueOf())

  return rss({
    title: SITE.NAME,
    description: SITE.DESCRIPTION,
    site: context.site ?? "https://ericc.ch",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
    })),
  })
}
