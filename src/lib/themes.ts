import type { ThemeFile } from "@lib/contrast"

const modules = import.meta.glob<ThemeFile>("../themes/*.json", { eager: true, import: "default" })

export const themes = Object.values(modules).sort((first, second) => first.order - second.order)

export const themeNames = themes.map((theme) => theme.name)

export const schemeByName = Object.fromEntries(
  themes.map((theme) => [theme.name, theme.scheme] as const),
) as Record<string, "light" | "dark">
