/** "2026-04-07" as "2026/04/07", the site's date format. */
export function formatDate(day: string): string {
  return day.replaceAll("-", "/")
}

export function readingTime(body: string | undefined): string {
  if (!body) return ""

  const words = body.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function dateRange(start: string, end: string): string {
  return start === end ? start : `${start} - ${end}`
}
