import { readFileSync } from "node:fs"
import type { APIRoute } from "astro"

export const GET: APIRoute = () =>
  new Response(readFileSync("src/styles/tokens.css", "utf8"), {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  })
