import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:4321"
const EVIDENCE = ".audit/evidence"

const ARTICLE = "/posts/writing-my-own-shitty-version-of-executor/"
const TOKEN = "Page Snapshot"

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

function luminance([red, green, blue]) {
  const channel = (value) => {
    const scaled = value / 255
    return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

function contrast(foreground, background) {
  const first = luminance(foreground)
  const second = luminance(background)
  const [light, dark] = first > second ? [first, second] : [second, first]
  return (light + 0.05) / (dark + 0.05)
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
  page.evaluate(
    ({ token }) => {
      const spans = [...document.querySelectorAll(".astro-code span")]
      const target = spans.find((span) => span.textContent === token)
      const pre = document.querySelector(".code pre")
      const wrap = document.querySelector(".wrap")
      const caption = document.querySelector(".code figcaption")
      return {
        theme: document.documentElement.dataset.theme ?? null,
        js: document.documentElement.dataset.js ?? null,
        body: getComputedStyle(document.body).backgroundColor,
        token: target ? getComputedStyle(target).color : null,
        tokenLight: target ? target.style.color : null,
        tokenDark: target ? getComputedStyle(target).getPropertyValue("--shiki-dark").trim() : null,
        preBackground: pre ? getComputedStyle(pre).backgroundColor : null,
        preFont: pre ? getComputedStyle(pre).fontFamily : null,
        preSize: pre ? getComputedStyle(pre).fontSize : null,
        captionSize: caption ? getComputedStyle(caption).fontSize : null,
        wrapWidth: wrap ? wrap.getBoundingClientRect().width : null,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        toggleLabel: document.getElementById("theme-toggle")?.textContent ?? null,
      }
    },
    { token: TOKEN },
  )

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
await wideContext.close()

const narrowContext = await browser.newContext({ viewport: { width: 320, height: 800 } })
const narrowPage = await narrowContext.newPage()
await narrowPage.goto(`${BASE}${ARTICLE}`)
const narrow = await read(narrowPage)
await narrowPage.screenshot({ path: `${EVIDENCE}/layout-320.png` })
await narrowContext.close()

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
  [
    "light palette applies",
    light.theme === "light" && light.body === "rgb(252, 252, 252)",
    `${light.theme} ${light.body}`,
  ],
  [
    "light code uses inline colour",
    same(light.token, light.tokenLight),
    `${light.token} vs ${light.tokenLight}`,
  ],
  [
    "dark palette applies",
    dark.theme === "dark" && dark.body === "rgb(17, 17, 17)",
    `${dark.theme} ${dark.body}`,
  ],
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
    "dark code readable",
    contrast(rgb(dark.token), rgb(dark.preBackground)) >= 4.5,
    `${contrast(rgb(dark.token), rgb(dark.preBackground)).toFixed(2)}:1`,
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
  [
    "code is 14px",
    wide.preSize === "14px" && wide.captionSize === "14px",
    `${wide.preSize} / ${wide.captionSize}`,
  ],
  ["measure caps at 48ch", wide.wrapWidth !== null && wide.wrapWidth < 600, `${wide.wrapWidth}px`],
  ["320px has no sideways scroll", narrow.overflow <= 0, `${narrow.overflow}px`],
]

for (const [label, condition, detail] of rows) check(label, condition, detail)

writeFileSync(
  `${EVIDENCE}/results.json`,
  JSON.stringify(
    {
      base: BASE,
      at: new Date().toISOString(),
      results,
      states: { light, dark, darkNoJs, toggled, wide, narrow },
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
