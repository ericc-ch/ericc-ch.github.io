import mdx from "@astrojs/mdx"
import { satteri } from "@astrojs/markdown-satteri"
import sitemap from "@astrojs/sitemap"
import { defineConfig } from "astro/config"
import codeBlocks from "./src/lib/code-blocks.ts"

export default defineConfig({
  site: "https://ericc.ch/",
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [codeBlocks] }),
    shikiConfig: {
      themes: {
        light: "github-light-high-contrast",
        dark: "github-dark-high-contrast",
      },
    },
  },
  redirects: {
    "/blog": "/posts/",
    "/work": "/",
    "/projects": "/",
  },
})
