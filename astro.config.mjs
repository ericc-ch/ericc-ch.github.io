import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ericc.ch/",
  integrations: [mdx(), sitemap(), tailwind()],
  output: "hybrid",
  adapter: cloudflare()
});