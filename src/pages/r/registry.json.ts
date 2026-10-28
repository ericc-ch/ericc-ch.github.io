import type { APIRoute } from "astro"

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://ericc.ch")

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ericc",
    homepage: origin.href,
    items: [
      {
        name: "light",
        type: "registry:theme",
        title: "Light theme",
        description: "The light palette from ericc.ch.",
      },
      {
        name: "dark",
        type: "registry:theme",
        title: "Dark theme",
        description: "The dark palette from ericc.ch.",
      },
    ],
  }

  return new Response(JSON.stringify(index, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
