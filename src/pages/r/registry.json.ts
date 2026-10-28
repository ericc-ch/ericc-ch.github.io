import type { APIRoute } from "astro"
import { themes } from "@lib/themes"

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://ericc.ch")

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ericc",
    homepage: origin.href,
    items: themes.map((theme) => ({
      name: theme.name,
      type: "registry:theme",
      title: `${theme.label} theme`,
      description: `The ${theme.label.toLowerCase()} theme for the ericc.ch design system.`,
    })),
  }

  return new Response(JSON.stringify(index, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
