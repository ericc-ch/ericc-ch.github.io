import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://ericc.ch/",
  // Keep v6 whitespace handling. Astro 7 defaults to JSX whitespace rules,
  // which strips spaces between inline elements used across the site.
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
