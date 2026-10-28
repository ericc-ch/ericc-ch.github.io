import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    })
    .strict(),
})

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z
    .object({
      company: z.string(),
      role: z.string(),
      dateStart: z.string().regex(/^\d{4}$/),
      dateEnd: z.string().regex(/^\d{4}$/),
    })
    .strict(),
})

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      draft: z.boolean().optional(),
      demoURL: z.string().optional(),
      repoURL: z.string().optional(),
    })
    .strict(),
})

export const collections = { blog, work, projects }
