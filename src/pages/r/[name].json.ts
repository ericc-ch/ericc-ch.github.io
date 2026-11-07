import type { APIRoute, GetStaticPaths } from "astro"
import { REGISTRY_ITEMS } from "@lib/registry"

export const getStaticPaths = (() =>
  REGISTRY_ITEMS.map((item) => ({
    params: { name: item.name },
    props: { item },
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => {
  const { item } = props as { item: (typeof REGISTRY_ITEMS)[number] }

  return new Response(
    JSON.stringify(
      { $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  )
}
