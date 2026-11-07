what else do you need to know? This is my website source code

oh I used https://github.com/markhorn-dev/astro-nano by the way

design decisions live in public/DESIGN.md, served at ericc.ch/DESIGN.md. `bun run check` for a change, `bun run verify` for anything visual.

deploys are [alchemy](https://alchemy.run): `alchemy.run.ts` describes the Worker, `bun cf:plan` shows the diff, `bun cf:deploy` ships prod. pushes to main do the same from GitHub Actions, which reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from repo secrets.
