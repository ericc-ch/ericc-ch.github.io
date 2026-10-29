/** @jsxImportSource satori/jsx */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { Resvg, initWasm } from "@resvg/resvg-wasm"
import satori from "satori"
import { parsePalettes } from "@lib/palette"

export interface OgCard {
  title: string
  label?: string
  subtitle?: string
  date?: string
}

const WIDTH = 1200
const HEIGHT = 630
const PADDING = 80

const nodeModules = (path: string) => readFileSync(resolve(process.cwd(), "node_modules", path))

let wasm: Promise<void> | undefined

function initResvg(): Promise<void> {
  wasm ??= initWasm(nodeModules("@resvg/resvg-wasm/index_bg.wasm"))
  return wasm
}

function fonts() {
  return [
    {
      name: "Plus Jakarta Sans",
      data: nodeModules(
        "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2",
      ),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Plus Jakarta Sans",
      data: nodeModules(
        "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
      ),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: nodeModules(
        "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
      ),
      weight: 400 as const,
      style: "normal" as const,
    },
  ]
}

/**
 * Renders the 1200x630 social card for one page.
 *
 * The card is the site's type on paper: the name top-left, the page title in the
 * lower half, and the date bottom-left when the page has one. It uses the light
 * palette only, because social previews have no colour scheme.
 *
 * @param card Title, optional kicker above it, optional subtitle, optional mono date.
 * @returns PNG bytes, ready to be returned from an Astro endpoint.
 */
export async function renderOgImage(card: OgCard): Promise<Uint8Array> {
  const { light } = parsePalettes(readFileSync("src/styles/themes.css", "utf8"))

  await initResvg()

  const svg = await satori(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        background: light["--bg-0"],
        color: light["--fg-0"],
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      {card.label ? (
        <div
          style={{
            position: "absolute",
            left: `${PADDING}px`,
            top: "74px",
            fontSize: "28px",
            color: light["--fg-1"],
          }}
        >
          {card.label}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: `${PADDING}px`,
          right: `${PADDING}px`,
          bottom: "140px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.011em",
          }}
        >
          {card.title}
        </div>

        {card.subtitle ? (
          <div
            style={{ marginTop: "24px", fontSize: "30px", lineHeight: 1.4, color: light["--fg-1"] }}
          >
            {card.subtitle}
          </div>
        ) : null}
      </div>

      {card.date ? (
        <div
          style={{
            position: "absolute",
            left: `${PADDING}px`,
            bottom: "40px",
            fontFamily: "JetBrains Mono",
            fontSize: "24px",
            color: light["--fg-1"],
          }}
        >
          {card.date}
        </div>
      ) : null}
    </div>,
    { width: WIDTH, height: HEIGHT, fonts: fonts() },
  )

  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng()
}
