import mdx from "@astrojs/mdx"
import { satteri } from "@astrojs/markdown-satteri"
import { defineConfig } from "astro/config"
import blocks from "./src/lib/blocks.ts"

export default defineConfig({
  site: "https://ericc.ch/",
  compressHTML: true,
  integrations: [mdx()],
  markdown: {
    processor: satteri({ hastPlugins: blocks }),
    shikiConfig: {
      defaultColor: "light-dark()",
      themes: {
        light: "vitesse-light",
        dark: "vitesse-black",
      },
    },
  },
})
