import type { APIRoute, GetStaticPaths } from "astro"
import { getCollection } from "astro:content"
import { SITE } from "@consts"
import { renderOgImage, type OgCard } from "@lib/og"
import { formatDate } from "@lib/utils"

export const getStaticPaths = (async () => {
  const posts = (await getCollection("blog")).filter((post) => !post.data.draft)

  return [
    {
      params: { slug: "home" },
      props: { card: { title: "Erick Christian", subtitle: SITE.DESCRIPTION } },
    },
    {
      params: { slug: "posts" },
      props: { card: { label: "Erick Christian", title: "Posts" } },
    },
    ...posts.map((post) => ({
      params: { slug: post.id },
      props: {
        card: {
          label: "Erick Christian",
          title: post.data.title,
          date: formatDate(post.data.date),
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
