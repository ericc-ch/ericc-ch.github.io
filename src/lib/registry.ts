import { readFileSync } from "node:fs"
import { parseTokens } from "@lib/tokens"

const css = readFileSync("src/styles/tokens.css", "utf8")
const tokens = parseTokens(css)

const summary = tokens.groups
  .map((group) => `${group.tokens.length} ${group.title.toLowerCase()} tokens`)
  .join(", ")

/** The file as written, for anyone who wants the tokens without a build step. */
const tokensFile = {
  name: "tokens",
  type: "registry:file",
  title: "Erick's design tokens",
  description: `The raw tokens.css file. ${summary}.`,
  files: [
    {
      path: "tokens.css",
      type: "registry:file",
      target: "~/tokens.css",
      content: css,
    },
  ],
  docs: "Import tokens.css once. It sets color-scheme and defines every token with light-dark().",
} as const

/** The same values as CSS variables, for projects that already use Tailwind. */
const tokensTheme = {
  name: "tokens-theme",
  type: "registry:theme",
  title: "Erick's design tokens for Tailwind",
  description: `The same tokens as CSS variables. ${summary}.`,
  cssVars: {
    theme: tokens.theme,
    light: tokens.light,
    dark: tokens.dark,
  },
  meta: {
    source: "https://ericc.ch/r/tokens.css",
    groups: tokens.groups,
  },
  docs: "Colour tokens install as :root and .dark variables. Type and space tokens install into the Tailwind theme (@theme), so they need Tailwind v4.",
} as const

export const REGISTRY_ITEMS = [tokensFile, tokensTheme]

export const REGISTRY_INDEX = REGISTRY_ITEMS.map(({ name, type, title, description }) => ({
  name,
  type,
  title,
  description,
}))
