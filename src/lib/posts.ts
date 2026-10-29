import { getCollection, type CollectionEntry } from "astro:content"

/** Every post the site publishes, newest first. Drafts never reach a page, a feed or a card. */
export async function getPublishedPosts(): Promise<Array<CollectionEntry<"blog">>> {
  return (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((first, second) => second.data.date.valueOf() - first.data.date.valueOf())
}
