export type Palette = Record<string, string>

export interface Token {
  /** Variable name without the leading `--`, e.g. `bg-0`. */
  name: string
  value: string
  description?: string
}

export interface TokenGroup {
  id: string
  title: string
  description: string
  tokens: Array<Token>
}

export interface Tokens {
  groups: Array<TokenGroup>
  /** Tokens that carry a `light-dark()` pair, split by scheme. */
  light: Palette
  dark: Palette
  /** Tokens that do not change with the colour scheme. */
  theme: Palette
}

const ROOT_BLOCK = /:root\s*\{([\s\S]*?)\n\}/
const GROUP_COMMENT = /^\/\*\s*(.+?)\s*\*\/$/
const DECLARATION = /^\s*(--[a-z0-9-]+)\s*:\s*(.+?);\s*(?:\/\*\s*(.+?)\s*\*\/)?\s*$/i
const LIGHT_DARK = /^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/

function groupId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function splitLightDark(value: string): [string, string] | undefined {
  const match = LIGHT_DARK.exec(value)
  return match ? [match[1], match[2]] : undefined
}

/**
 * Read the token file into groups and per-scheme palettes.
 *
 * The file is the source of truth, so the registry never duplicates a value:
 * add a declaration under a group comment and it shows up in the published
 * item.
 */
export function parseTokens(css: string): Tokens {
  const scope = ROOT_BLOCK.exec(css)
  if (!scope) throw new Error("Could not find the :root token block")

  const groups: Array<TokenGroup> = []
  let current: TokenGroup | undefined

  for (const rawLine of scope[1].split("\n")) {
    const line = rawLine.trim()
    if (!line) continue

    const comment = GROUP_COMMENT.exec(line)
    if (comment) {
      const [title, ...rest] = comment[1].split(":")
      current = {
        id: groupId(title),
        title: title.trim(),
        description: rest.join(":").trim(),
        tokens: [],
      }
      groups.push(current)
      continue
    }

    const declaration = DECLARATION.exec(line)
    if (!declaration || !current) continue

    const [, name, value, description] = declaration
    current.tokens.push({
      name: name.slice(2),
      value: value.trim(),
      description: description?.trim(),
    })
  }

  const light: Palette = {}
  const dark: Palette = {}
  const theme: Palette = {}

  for (const group of groups) {
    for (const token of group.tokens) {
      const pair = splitLightDark(token.value)
      if (pair) {
        light[token.name] = pair[0]
        dark[token.name] = pair[1]
      } else {
        theme[token.name] = token.value
      }
    }
  }

  if (Object.keys(light).length === 0) {
    throw new Error("No light-dark() tokens found in the :root token block")
  }

  return { groups, light, dark, theme }
}
