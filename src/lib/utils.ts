export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}/${month}/${day}`
}

export function readingTime(body: string | undefined): string {
  if (!body) return ""

  const words = body.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function dateRange(start: string, end: string): string {
  return start === end ? start : `${start} - ${end}`
}
