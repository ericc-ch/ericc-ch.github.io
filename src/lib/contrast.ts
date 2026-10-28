export type ThemeTokens = Record<string, string>

export type ThemeFile = {
  name: string
  label: string
  scheme: "light" | "dark"
  order: number
  tokens: ThemeTokens
}

export type Rule = {
  label: string
  foreground: string
  background: string
  minimum: number
}

const REQUIRED_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--radius",
] as const

function toRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null

  const value = match[1]
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function linearChannel(value: number): number {
  const scaled = value / 255
  return scaled <= 0.040_45 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const rgb = toRgb(hex)
  if (!rgb) throw new Error(`Not a six digit hex colour: ${hex}`)

  const [red, green, blue] = rgb
  return 0.2126 * linearChannel(red) + 0.7152 * linearChannel(green) + 0.0722 * linearChannel(blue)
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground)
  const second = luminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

export function themeRules(tokens: ThemeTokens): Array<Rule> {
  return [
    {
      label: "body text",
      foreground: tokens["--foreground"],
      background: tokens["--background"],
      minimum: 7,
    },
    {
      label: "metadata",
      foreground: tokens["--muted-foreground"],
      background: tokens["--background"],
      minimum: 4.5,
    },
    {
      label: "links",
      foreground: tokens["--primary"],
      background: tokens["--background"],
      minimum: 4.5,
    },
    {
      label: "text on link fill",
      foreground: tokens["--primary-foreground"],
      background: tokens["--primary"],
      minimum: 4.5,
    },
    {
      label: "code text on code background",
      foreground: tokens["--foreground"],
      background: tokens["--muted"],
      minimum: 7,
    },
    {
      label: "selected row",
      foreground: tokens["--accent-foreground"],
      background: tokens["--accent"],
      minimum: 7,
    },
    {
      label: "focus ring",
      foreground: tokens["--ring"],
      background: tokens["--background"],
      minimum: 3,
    },
    {
      label: "danger text",
      foreground: tokens["--destructive"],
      background: tokens["--background"],
      minimum: 4.5,
    },
    {
      label: "hairline rule",
      foreground: tokens["--border"],
      background: tokens["--background"],
      minimum: 1.2,
    },
    {
      label: "field edge",
      foreground: tokens["--input"],
      background: tokens["--background"],
      minimum: 1.5,
    },
  ]
}

export function missingTokens(theme: ThemeFile): Array<string> {
  return REQUIRED_TOKENS.filter((token) => typeof theme.tokens[token] !== "string")
}

export function checkTheme(theme: ThemeFile): Array<string> {
  const problems = missingTokens(theme).map((token) => `missing token ${token}`)

  for (const token of REQUIRED_TOKENS) {
    if (token === "--radius") continue
    const value = theme.tokens[token]
    if (value && toRgb(value) === null) problems.push(`${token} is not a six digit hex colour`)
  }

  for (const rule of themeRules(theme.tokens)) {
    if (!rule.foreground || !rule.background) continue
    if (toRgb(rule.foreground) === null || toRgb(rule.background) === null) continue

    const ratio = contrastRatio(rule.foreground, rule.background)
    if (ratio < rule.minimum) {
      problems.push(
        `${theme.name}: ${rule.label} is ${ratio.toFixed(2)}:1, needs ${rule.minimum}:1 (${rule.foreground} on ${rule.background})`,
      )
    }
  }

  return problems
}
