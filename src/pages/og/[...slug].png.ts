import type { APIRoute, GetStaticPaths } from "astro"
import { SITE } from "@consts"
import { renderOgImage, type OgCard } from "@lib/og"
import { getAllPosts } from "@lib/posts"
import { formatDate } from "@lib/utils"

export const getStaticPaths = (async () => {
  const posts = await getAllPosts()

  return [
    {
      params: { slug: "home" },
      props: { card: { title: SITE.NAME, subtitle: SITE.DESCRIPTION } },
    },
    {
      params: { slug: "posts" },
      props: { card: { label: SITE.NAME, title: "Posts" } },
    },
    ...posts.map((post) => ({
      params: { slug: post.id },
      props: {
        card: {
          label: SITE.NAME,
          title: post.data.title,
          date: formatDate(post.data.createdAt),
        },
      },
    })),
  ]
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { card } = props as { card: OgCard }
  const png = await renderOgImage(card)

  return new Response(png.slice().buffer, {
    headers: { "Content-Type": "image/png" },
  })
}
