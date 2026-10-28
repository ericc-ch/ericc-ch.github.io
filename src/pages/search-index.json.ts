import { getCollection } from "astro:content"
import type { APIRoute } from "astro"
import { formatDate } from "@lib/utils"

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((first, second) => second.data.date.valueOf() - first.data.date.valueOf())

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags ?? [],
    url: `/posts/${post.id}/`,
    date: formatDate(post.data.date),
  }))

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
