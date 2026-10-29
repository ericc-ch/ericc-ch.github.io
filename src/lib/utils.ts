export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}/${month}/${day}`
}

/** The same calendar day as formatDate, in the form the datetime attribute expects. */
export function isoDate(date: Date): string {
  return formatDate(date).replaceAll("/", "-")
}

/**
 * The calendar day a date was written for, moved to UTC midnight.
 *
 * Frontmatter dates are parsed in the build machine's zone, so a feed rendered in UTC+7 would
 * otherwise publish a post one day early for a reader in UTC.
 */
export function utcDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function readingTime(body: string | undefined): string {
  if (!body) return ""

  const words = body.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function dateRange(start: string, end: string): string {
  return start === end ? start : `${start} - ${end}`
}
