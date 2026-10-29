import { SITE, SOCIALS } from "@consts"
import { isoDate } from "@lib/utils"

export interface ArticleMeta {
  published: Date
  modified?: Date
  tags?: Array<string>
}

interface SchemaInput {
  site: URL
  canonical: URL
  title: string
  description: string
  image: URL
  article?: ArticleMeta
}

/**
 * The JSON-LD graph for one page.
 *
 * Every page names the same Person and WebSite by `@id`, so search engines see one author and
 * one site rather than a fresh entity per URL. An article adds its BlogPosting and its place in
 * the breadcrumb trail.
 */
export function structuredData({
  site,
  canonical,
  title,
  description,
  image,
  article,
}: SchemaInput) {
  const origin = new URL("/", site)
  const person = {
    "@type": "Person",
    "@id": `${origin.href}#person`,
    name: SITE.NAME,
    url: origin.href,
    email: `mailto:${SITE.EMAIL}`,
    description: SITE.DESCRIPTION,
    sameAs: SOCIALS.map((social) => social.HREF),
  }

  const website = {
    "@type": "WebSite",
    "@id": `${origin.href}#website`,
    url: origin.href,
    name: SITE.NAME,
    description: SITE.DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${origin.href}#person` },
  }

  const graph: Array<Record<string, unknown>> = [person, website]

  if (article) {
    const modified = article.modified ?? article.published

    graph.push({
      "@type": "BlogPosting",
      "@id": `${canonical.href}#post`,
      mainEntityOfPage: canonical.href,
      headline: title,
      description,
      image: image.href,
      datePublished: isoDate(article.published),
      dateModified: isoDate(modified),
      inLanguage: "en",
      author: { "@id": `${origin.href}#person` },
      publisher: {
        "@type": "Organization",
        name: SITE.NAME,
        url: origin.href,
        logo: {
          "@type": "ImageObject",
          url: new URL("/apple-touch-icon.png", origin).href,
        },
      },
      isPartOf: { "@id": `${origin.href}#website` },
      ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
    })

    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical.href}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin.href },
        {
          "@type": "ListItem",
          position: 2,
          name: "Posts",
          item: new URL("/posts/", origin).href,
        },
        { "@type": "ListItem", position: 3, name: title },
      ],
    })
  }

  return { "@context": "https://schema.org", "@graph": graph }
}

/** JSON.stringify, with `<` escaped so a title can never close the script element. */
export function serializeSchema(schema: unknown): string {
  return JSON.stringify(schema).replaceAll("<", "\\u003c")
}
