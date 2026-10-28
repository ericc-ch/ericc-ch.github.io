export function formatDate(date: Date): string {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function readingTime(body: string | undefined): string {
  if (!body) return ""

  const words = body.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function dateRange(start: string, end: string): string {
  return start === end ? start : `${start} - ${end}`
}
