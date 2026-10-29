import type { APIRoute, GetStaticPaths } from "astro"
import { REGISTRY_ITEMS, THEMES } from "@lib/registry"

export const getStaticPaths = (() =>
  THEMES.map((theme) => ({
    params: { name: theme.name },
    props: { theme },
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => {
  const { theme } = props as { theme: (typeof THEMES)[number] }

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...REGISTRY_ITEMS.find((entry) => entry.name === theme.name),
    cssVars: {
      light: theme.palette,
      dark: theme.palette,
    },
  }

  return new Response(JSON.stringify(item, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
