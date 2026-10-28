import type { APIRoute, GetStaticPaths } from "astro"
import { readFileSync } from "node:fs"
import { parsePalettes } from "@lib/palette"

const { light, dark } = parsePalettes(readFileSync("src/styles/themes.css", "utf8"))

const THEMES = [
  { name: "light", label: "Light", palette: light },
  { name: "dark", label: "Dark", palette: dark },
]

export const getStaticPaths = (() =>
  THEMES.map((theme) => ({
    params: { name: theme.name },
    props: { theme },
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => {
  const { theme } = props as { theme: (typeof THEMES)[number] }

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: theme.name,
    type: "registry:theme",
    title: `${theme.label} theme`,
    description: `The ${theme.label.toLowerCase()} palette from ericc.ch. Six monochrome tokens; the variable names are not shadcn's.`,
    cssVars: {
      light: theme.palette,
      dark: theme.palette,
    },
  }

  return new Response(JSON.stringify(item, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
