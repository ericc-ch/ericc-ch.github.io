import { readFileSync } from "node:fs"
import { parsePalettes } from "@lib/palette"

const { light, dark } = parsePalettes(readFileSync("src/styles/themes.css", "utf8"))

/** The palette, published as a shadcn registry so other projects can install it. */
export const THEMES = [
  { name: "light", label: "Light", palette: light },
  { name: "dark", label: "Dark", palette: dark },
]

export const REGISTRY_ITEMS = THEMES.map((theme) => ({
  name: theme.name,
  type: "registry:theme",
  title: `${theme.label} theme`,
  description: `The ${theme.label.toLowerCase()} palette from ericc.ch. Six monochrome tokens; the variable names are not shadcn's.`,
}))
