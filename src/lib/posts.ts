import { getCollection, type CollectionEntry } from "astro:content"

type Post = CollectionEntry<"blog">

/** Every post in the repository, newest first, drafts included. */
export async function getAllPosts(): Promise<Array<Post>> {
  return (await getCollection("blog")).sort(
    (first, second) => second.data.date.valueOf() - first.data.date.valueOf(),
  )
}

/** The posts the site publishes: listed, fed, sitemapped and indexed. */
export async function getPublishedPosts(): Promise<Array<Post>> {
  return (await getAllPosts()).filter((post) => !post.data.draft)
}
