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
 * lower half, a hairline, then a mono footer of date and domain. It uses the
 * light palette only, because social previews have no colour scheme.
 *
 * @param card Title, optional kicker above it, optional mono date in the footer.
 * @returns PNG bytes, ready to be returned from an Astro endpoint.
 */
export async function renderOgImage(card: OgCard): Promise<Uint8Array> {
  const { light } = parsePalettes(readFileSync("src/styles/themes.css", "utf8"))
  const background = light["--bg-0"]
  const ink = light["--fg-0"]
  const muted = light["--fg-1"]
  const hairline = light["--fg-2"]

  await initResvg()

  const children = []

  if (card.label) {
    children.push({
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: `${PADDING}px`,
          top: "74px",
          fontSize: "28px",
          color: muted,
        },
        children: card.label,
      },
    })
  }

  children.push({
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: `${PADDING}px`,
        right: `${PADDING}px`,
        bottom: "140px",
        display: "flex",
        flexDirection: "column",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "64px",
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: "-0.011em",
            },
            children: card.title,
          },
        },
        ...(card.subtitle
          ? [
              {
                type: "div",
                props: {
                  style: {
                    marginTop: "24px",
                    fontSize: "30px",
                    lineHeight: 1.4,
                    color: muted,
                  },
                  children: card.subtitle,
                },
              },
            ]
          : []),
      ],
    },
  })

  children.push(
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: `${PADDING}px`,
          right: `${PADDING}px`,
          bottom: `${PADDING}px`,
          height: "1px",
          background: hairline,
        },
        children: "",
      },
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: `${PADDING}px`,
          right: `${PADDING}px`,
          bottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "JetBrains Mono",
          fontSize: "24px",
          color: muted,
        },
        children: [
          { type: "div", props: { style: {}, children: card.date ?? "" } },
          { type: "div", props: { style: {}, children: "ericc.ch" } },
        ],
      },
    },
  )

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          position: "relative",
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          background,
          color: ink,
          fontFamily: "Plus Jakarta Sans",
        },
        children,
      },
    },
    { width: WIDTH, height: HEIGHT, fonts: fonts() },
  )

  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng()
}
