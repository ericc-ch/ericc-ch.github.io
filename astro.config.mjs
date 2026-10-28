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
      defaultColor: "light-dark()",
      themes: {
        light: "vitesse-light",
        dark: "vitesse-black",
      },
    },
  },
})
