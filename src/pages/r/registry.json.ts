import type { APIRoute } from "astro"
import { REGISTRY_ITEMS } from "@lib/registry"

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://ericc.ch")

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ericc",
    homepage: origin.href,
    items: REGISTRY_ITEMS,
  }

  return new Response(JSON.stringify(index, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
