# Verification features

Four flows, all driven by `.agents/skills/verify-site/check.mjs`. None are covered by a
native test suite; there is no E2E suite in this repo.

| Feature                       | File              | Status        |
| ----------------------------- | ----------------- | ------------- |
| Theme states and the toggle   | `theme-states.md` | deterministic |
| Code block colours and type   | `code-blocks.md`  | deterministic |
| Measure and overflow          | `layout.md`       | deterministic |
| Drafts, feeds and the sitemap | `publishing.md`   | deterministic |

`deterministic` means the flow was run end to end and passes on the current build. Promote
to `graduated-to-e2e` when a real spec exists under `tests/e2e/`.

Run everything:

```sh
bun run build && bun run preview
bun .agents/skills/verify-site/check.mjs
bunx astro preview stop
```
