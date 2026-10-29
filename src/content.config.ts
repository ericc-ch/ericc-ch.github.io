import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

/** A calendar day as YYYY-MM-DD, so it sorts as a string and carries no timezone. */
const calendarDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Write the day as YYYY-MM-DD")

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string(),
      /** Append "· Erick Christian" to the page title. */
      titleSuffix: z.boolean().default(false),
      description: z.string(),
      createdAt: calendarDay,
      updatedAt: calendarDay.optional(),
      tags: z.array(z.string()).optional(),
      /** False builds the page at its URL, marks it noindex and leaves it out of every list. */
      published: z.boolean(),
    })
    .strict(),
})

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z
    .object({
      company: z.string(),
      role: z.string(),
      dateStart: z.string().regex(/^\d{4}\/\d{2}$/),
      dateEnd: z.string().regex(/^\d{4}\/\d{2}$/),
    })
    .strict(),
})

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      createdAt: calendarDay,
      published: z.boolean(),
      demoURL: z.string().optional(),
      repoURL: z.string().optional(),
    })
    .strict(),
})

export const collections = { blog, work, projects }
