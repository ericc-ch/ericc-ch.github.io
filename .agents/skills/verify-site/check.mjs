import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:4321"
const EVIDENCE = ".audit/evidence"

// Deliberate exception: the code themes are chosen for tone, not contrast. Re-record these
// when the themes change; the check exists to catch regressions, not to certify AA.
const CODE_CONTRAST = { light: 1.8, dark: 2.15 }

const ARTICLE = "/posts/writing-my-own-shitty-version-of-executor/"

function resolveChromium() {
  if (process.env.CHROMIUM_BIN) return process.env.CHROMIUM_BIN
  try {
    return execSync("command -v helium", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return undefined // fall back to Playwright's bundled browser
  }
}

const rgb = (value) =>
  value
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)

const hexToRgb = (value) => {
  const match = /^#([0-9a-f]{6})$/i.exec(value?.trim() ?? "")
  if (!match) return null
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16))
}

const read = (page) =>
  page.evaluate(() => {
    const spans = [...document.querySelectorAll(".astro-code span")]
    const isToken = (span) =>
      span.textContent.trim() && span.style.getPropertyValue("--shiki-light")
    const target = spans.find(isToken)
    const pre = document.querySelector(".code pre")
    const date = document.querySelector(".post-meta time")
    const wrap = document.querySelector(".wrap")
    const caption = document.querySelector(".code figcaption")

    const channel = (value) => {
      const scaled = value / 255
      return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
    }
    const luminance = ([red, green, blue]) =>
      0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
    const ratio = (first, second) => {
      const a = luminance(first)
      const b = luminance(second)
      const [light, dark] = a > b ? [a, b] : [b, a]
      return (light + 0.05) / (dark + 0.05)
    }
    const parse = (value) => {
      const parts = value?.match(/[\d.]+/g)?.map(Number) ?? []
      return parts.length >= 3 ? [parts[0], parts[1], parts[2], parts[3] ?? 1] : null
    }

    let worst = { ratio: 99, text: null, color: null }
    if (pre) {
      const background = parse(getComputedStyle(pre).backgroundColor)
      if (background) {
        for (const span of spans) {
          if (!isToken(span)) continue
          const foreground = parse(getComputedStyle(span).color)
          if (!foreground) continue
          const blended = foreground
            .slice(0, 3)
            .map((value, index) =>
              Math.round(value * foreground[3] + background[index] * (1 - foreground[3])),
            )
          const value = ratio(blended, background)
          if (value < worst.ratio) {
            worst = {
              ratio: Number(value.toFixed(2)),
              text: span.textContent.trim().slice(0, 20),
              color: getComputedStyle(span).color,
            }
          }
        }
      }
    }

    return {
      theme: document.documentElement.dataset.theme ?? null,
      js: document.documentElement.dataset.js ?? null,
      body: getComputedStyle(document.body).backgroundColor,
      token: target ? getComputedStyle(target).color : null,
      tokenLight: target ? getComputedStyle(target).getPropertyValue("--shiki-light").trim() : null,
      tokenDark: target ? getComputedStyle(target).getPropertyValue("--shiki-dark").trim() : null,
      tokenMin: worst,
      preBackground: pre ? getComputedStyle(pre).backgroundColor : null,
      preFont: pre ? getComputedStyle(pre).fontFamily : null,
      dateFont: date ? getComputedStyle(date).fontFamily : null,
      dateText: date ? date.textContent.trim() : null,
      preSize: pre ? getComputedStyle(pre).fontSize : null,
      captionSize: caption ? getComputedStyle(caption).fontSize : null,
      wrapWidth: wrap ? wrap.getBoundingClientRect().width : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      toggleLabel: document.getElementById("theme-toggle")?.textContent ?? null,
    }
  })

const results = []
const failures = []

function check(label, condition, detail) {
  results.push({ label, pass: Boolean(condition), detail })
  if (!condition) failures.push(`${label} (${detail})`)
}

mkdirSync(EVIDENCE, { recursive: true })

const executablePath = resolveChromium()
const browser = await chromium.launch(executablePath ? { executablePath } : {})

async function visit(name, contextOptions, javaScriptEnabled = true) {
  const context = await browser.newContext({ ...contextOptions, javaScriptEnabled })
  const page = await context.newPage()
  const response = await page.goto(`${BASE}${ARTICLE}`, { waitUntil: "load" })
  const state = await read(page)
  await page.screenshot({ path: `${EVIDENCE}/${name}.png`, fullPage: false })
  await context.close()
  return { status: response?.status(), ...state }
}

const light = await visit("theme-light", { colorScheme: "light" })
const dark = await visit("theme-dark", { colorScheme: "dark" })
const darkNoJs = await visit("theme-dark-nojs", { colorScheme: "dark" }, false)

const toggleContext = await browser.newContext({ colorScheme: "light" })
const togglePage = await toggleContext.newPage()
await togglePage.goto(`${BASE}${ARTICLE}`)
await togglePage.click("#theme-toggle")
const toggled = await read(togglePage)
await togglePage.screenshot({ path: `${EVIDENCE}/theme-toggle.png` })
await togglePage.click("#theme-toggle")
const toggledBack = await read(togglePage)
await toggleContext.close()

const wideContext = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const widePage = await wideContext.newPage()
await widePage.goto(`${BASE}${ARTICLE}`)
const wide = await read(widePage)

// Layers are global by name, so a style tag joins the existing layers. `base` must lose to
// `prose` even with a higher-specificity selector; `ui` must win with the same selector.
const layered = await widePage.evaluate(() => {
  const heading = document.querySelector(".prose h2")
  const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
  const layers = rules.filter((rule) => rule instanceof CSSLayerBlockRule).map((rule) => rule.name)
  const unlayered = rules
    .filter((rule) => !(rule instanceof CSSLayerBlockRule))
    .map((rule) => rule.constructor.name)

  const style = document.createElement("style")
  document.head.append(style)

  const before = getComputedStyle(heading).marginBlockStart
  const marginWith = (layer) => {
    style.textContent = `@layer ${layer} { .prose h2 { margin-block-start: 200px } }`
    return getComputedStyle(heading).marginBlockStart
  }

  return {
    layers,
    unlayered,
    before,
    early: marginWith("base"),
    late: marginWith("ui"),
  }
})

await wideContext.close()

const narrowContext = await browser.newContext({ viewport: { width: 320, height: 800 } })
const narrowPage = await narrowContext.newPage()
await narrowPage.goto(`${BASE}${ARTICLE}`)
const narrow = await read(narrowPage)
await narrowPage.screenshot({ path: `${EVIDENCE}/layout-320.png` })
await narrowContext.close()

const focusContext = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const focusPage = await focusContext.newPage()
await focusPage.goto(`${BASE}${ARTICLE}`)
for (let index = 0; index < 40; index += 1) {
  await focusPage.keyboard.press("Tab")
  if (await focusPage.evaluate(() => document.activeElement?.tagName === "PRE")) break
}
const focus = await focusPage.evaluate(() => {
  const figure = document.querySelector(".code")
  const style = figure ? getComputedStyle(figure) : null
  return {
    active: document.activeElement?.tagName ?? null,
    outline: style ? `${style.outlineStyle} ${style.outlineWidth}` : null,
  }
})
await focusPage.screenshot({ path: `${EVIDENCE}/code-focus.png` })
await focusContext.close()

const copyContext = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
})
const copyPage = await copyContext.newPage()
await copyPage.goto(`${BASE}${ARTICLE}`)
await copyPage.click(".copy")
await copyPage.waitForTimeout(150)
const copied = await copyPage.evaluate(async () => {
  let clipboard = null
  try {
    clipboard = await navigator.clipboard.readText()
  } catch {
    clipboard = null // insecure origin or no permission
  }
  return {
    button: document.querySelector(".copy")?.textContent ?? null,
    status: document.getElementById("copy-status")?.textContent ?? null,
    clipboard,
  }
})
await copyPage.screenshot({ path: `${EVIDENCE}/copy.png` })
await copyPage.waitForTimeout(2100)
const copyRestored = await copyPage.evaluate(
  () => document.querySelector(".copy")?.textContent ?? null,
)
await copyContext.close()

await browser.close()

const parseColor = (value) => {
  const hex = hexToRgb(value)
  if (hex) return hex
  return value?.startsWith("rgb") ? rgb(value) : null
}

const same = (computed, raw) => {
  const first = parseColor(computed)
  const second = parseColor(raw)
  return Boolean(first && second) && first.every((value, index) => value === second[index])
}

const rows = [
  ["article responds", light.status === 200, `HTTP ${light.status}`],
  ["light palette applies", light.body === "rgb(252, 252, 252)", `${light.theme} ${light.body}`],
  [
    "light code uses --shiki-light",
    same(light.token, light.tokenLight),
    `${light.token} vs ${light.tokenLight}`,
  ],
  ["dark palette applies", dark.body === "rgb(17, 17, 17)", `${dark.theme} ${dark.body}`],
  [
    "dark code uses --shiki-dark",
    same(dark.token, dark.tokenDark),
    `${dark.token} vs ${dark.tokenDark}`,
  ],
  [
    "dark code left the light palette",
    !same(dark.token, dark.tokenLight),
    `${dark.token} vs ${dark.tokenLight}`,
  ],
  [
    "light code contrast above floor",
    light.tokenMin.ratio >= CODE_CONTRAST.light,
    `${light.tokenMin.ratio}:1 at "${light.tokenMin.text}"`,
  ],
  [
    "dark code contrast above floor",
    dark.tokenMin.ratio >= CODE_CONTRAST.dark,
    `${dark.tokenMin.ratio}:1 at "${dark.tokenMin.text}"`,
  ],
  [
    "no-JS follows system dark",
    darkNoJs.theme === null && darkNoJs.body === "rgb(17, 17, 17)",
    `${darkNoJs.theme} ${darkNoJs.body}`,
  ],
  [
    "no-JS code uses --shiki-dark",
    same(darkNoJs.token, darkNoJs.tokenDark),
    `${darkNoJs.token} vs ${darkNoJs.tokenDark}`,
  ],
  ["toggle sets data-theme", toggled.theme === "dark", toggled.theme],
  ["toggle relabels itself", toggled.toggleLabel === "Light", toggled.toggleLabel],
  [
    "toggle reverts",
    toggledBack.theme === "light" && toggledBack.toggleLabel === "Dark",
    `${toggledBack.theme} ${toggledBack.toggleLabel}`,
  ],
  ["code is JetBrains Mono", wide.preFont?.includes("JetBrains Mono"), wide.preFont],
  ["dates are JetBrains Mono", wide.dateFont?.includes("JetBrains Mono"), wide.dateFont],
  ["dates are YYYY/MM/DD", /^\d{4}\/\d{2}\/\d{2}$/.test(wide.dateText ?? ""), wide.dateText],
  [
    "code is 14px",
    wide.preSize === "14px" && wide.captionSize === "14px",
    `${wide.preSize} / ${wide.captionSize}`,
  ],
  ["measure caps at 48ch", wide.wrapWidth !== null && wide.wrapWidth < 600, `${wide.wrapWidth}px`],
  [
    "styles ship in four layers",
    layered.layers.join(",") === "tokens,base,prose,ui",
    layered.layers.join(","),
  ],
  [
    "only @font-face is unlayered",
    layered.unlayered.length > 0 && layered.unlayered.every((type) => type === "CSSFontFaceRule"),
    [...new Set(layered.unlayered)].join(","),
  ],
  [
    "an earlier layer cannot override prose",
    layered.early === layered.before,
    `${layered.early} vs ${layered.before}`,
  ],
  ["the last layer overrides prose", layered.late === "200px", layered.late],
  ["320px has no sideways scroll", narrow.overflow <= 0, `${narrow.overflow}px`],
  ["copy reports success", copied.button === "Copied", copied.button],
  ["copy announces to a live region", copied.status === "Code copied to clipboard", copied.status],
  [
    "copy fills the clipboard",
    copied.clipboard === null ||
      (copied.clipboard.length > 100 && copied.clipboard.includes("console.log")),
    copied.clipboard === null ? "not readable on this origin" : `${copied.clipboard.length} chars`,
  ],
  ["copy resets its label", copyRestored === "Copy", copyRestored],
  [
    "code block keeps a visible focus ring",
    focus.active === "PRE" && focus.outline === "solid 2px",
    `${focus.active} ${focus.outline}`,
  ],
]

for (const [label, condition, detail] of rows) check(label, condition, detail)

writeFileSync(
  `${EVIDENCE}/results.json`,
  JSON.stringify(
    {
      base: BASE,
      at: new Date().toISOString(),
      results,
      states: { light, dark, darkNoJs, toggled, wide, narrow, layered },
    },
    null,
    2,
  ),
)

for (const row of results) {
  console.log(`${row.pass ? "pass" : "FAIL"}  ${row.label.padEnd(30)} ${row.detail}`)
}

console.log(`\n${results.length - failures.length}/${results.length} checks passed`)
console.log(`evidence: ${EVIDENCE}/`)

if (failures.length > 0) {
  console.error(`\nfailures:\n${failures.map((failure) => `  - ${failure}`).join("\n")}`)
  process.exit(1)
}
