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

export function dateRange(start: Date, end: Date | string): string {
  const startLabel = `${start.toLocaleString("en-US", { month: "short" })} ${start.getFullYear()}`

  if (typeof end === "string") return `${startLabel} to ${end}`

  const endLabel = `${end.toLocaleString("en-US", { month: "short" })} ${end.getFullYear()}`
  return `${startLabel} to ${endLabel}`
}
