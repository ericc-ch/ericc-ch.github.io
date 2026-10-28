export type Palette = Record<string, string>

function block(css: string, selector: RegExp): Palette {
  const match = selector.exec(css)
  if (!match) throw new Error(`Could not find palette block ${selector}`)

  const palette: Palette = {}
  const tokens = /(--[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi

  for (const [, token, value] of match[1].matchAll(tokens)) palette[token] = value

  return palette
}

export function parsePalettes(css: string): { light: Palette; dark: Palette } {
  return {
    light: block(css, /:root\s*\{([^}]*)\}/),
    dark: block(css, /\[data-theme="dark"\]\s*\{([^}]*)\}/),
  }
}
