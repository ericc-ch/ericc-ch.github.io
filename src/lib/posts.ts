import { getCollection, type CollectionEntry } from "astro:content"

type Post = CollectionEntry<"blog">

/** Every post in the repository, newest first, published or not. */
export async function getAllPosts(): Promise<Array<Post>> {
  return (await getCollection("blog")).sort((first, second) =>
    second.data.createdAt.localeCompare(first.data.createdAt),
  )
}

/** The posts the site lists, feeds, sitemaps and indexes. */
export async function getPublishedPosts(): Promise<Array<Post>> {
  return (await getAllPosts()).filter((post) => post.data.published)
}
