import type { APIRoute, GetStaticPaths } from "astro"
import type { ThemeFile } from "@lib/contrast"
import { themes } from "@lib/themes"

export const getStaticPaths = (() =>
  themes.map((theme) => ({
    params: { name: theme.name },
    props: { theme },
  }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => {
  const { theme } = props as { theme: ThemeFile }

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: theme.name,
    type: "registry:theme",
    title: `${theme.label} theme`,
    description: `The ${theme.label.toLowerCase()} theme for the ericc.ch design system. Applies in both light and dark mode because it defines a fixed palette.`,
    cssVars: {
      light: theme.tokens,
      dark: theme.tokens,
    },
  }

  return new Response(JSON.stringify(item, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
