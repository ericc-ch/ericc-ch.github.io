import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const blogDrafts = (await getCollection("blog")).filter((post) => post.data.draft);

  const projectDrafts = (await getCollection("projects")).filter((project) => project.data.draft);

  const baseRules = `User-agent: *
Allow: /
`;

  const draftDisallows = [
    ...blogDrafts.map((post) => `Disallow: /blog/${post.slug}/`),
    ...projectDrafts.map((project) => `Disallow: /projects/${project.slug}/`),
  ].join("\n");

  const sitemapLine = `Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}`;

  const content =
    draftDisallows.length > 0
      ? `${baseRules}${draftDisallows}\n\n${sitemapLine}`
      : `${baseRules}\n${sitemapLine}`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
