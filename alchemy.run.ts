import * as Alchemy from "alchemy"
import * as Cloudflare from "@alchemy.run/cloudflare"
import { Stack } from "alchemy/Stack"
import * as Effect from "effect/Effect"

// The site is a Worker with static assets: `bun run build` writes dist, and
// Cloudflare's asset layer serves it. Only prod owns the domain, so a preview
// stage cannot take ericc.ch from the live site.
export default Alchemy.Stack(
  "ericc-ch",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stack = yield* Stack

    const site = yield* Cloudflare.Website.StaticSite("Website", {
      command: "bun run build",
      outdir: "dist",
      assets: {
        notFoundHandling: "404-page",
      },
      ...(stack.stage === "prod" ? { domain: "ericc.ch", workersDev: false } : {}),
    })

    return { url: site.url }
  }),
)
