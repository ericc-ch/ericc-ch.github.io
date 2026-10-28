// Command palette. Loaded on demand by the inline loader in Base.astro.
// Kept as a plain, unbundled module on purpose: bundling it would ship a
// preload helper to every page.

(() => {
  const LIMIT = 8

  const dialog = document.getElementById("palette")
  const input = document.getElementById("palette-input")
  const list = document.getElementById("palette-results")
  const status = document.getElementById("palette-count")
  const empty = document.getElementById("palette-empty")

  if (!dialog || !input || !list) return

  let items = []
  let visible = []
  let active = 0
  let pending = null

  const load = () => {
    if (!pending) {
      pending = fetch("/search-index.json")
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => [])
    }
    return pending
  }

  const score = (item, query) => {
    const title = item.title.toLowerCase()
    if (title.startsWith(query)) return 5
    if (title.includes(query)) return 4
    if (item.tags.some((tag) => tag.toLowerCase().includes(query))) return 3
    if (item.description.toLowerCase().includes(query)) return 2
    return 0
  }

  const matches = (query) => {
    if (!query) return items.slice(0, LIMIT)

    const scored = []
    for (const item of items) {
      const value = score(item, query)
      if (value > 0) scored.push({ item, score: value })
    }

    scored.sort((first, second) => second.score - first.score)
    return scored.slice(0, LIMIT).map((entry) => entry.item)
  }

  const render = () => {
    list.replaceChildren()

    for (const [index, item] of visible.entries()) {
      const row = document.createElement("li")
      row.id = `palette-option-${index}`
      row.setAttribute("role", "option")
      row.setAttribute("aria-selected", String(index === active))

      const title = document.createElement("span")
      title.textContent = item.title

      const meta = document.createElement("span")
      meta.className = "meta"
      meta.textContent = item.date

      row.append(title, meta)
      list.append(row)
    }

    if (empty) empty.hidden = visible.length > 0
    if (status) status.textContent = `${visible.length} result${visible.length === 1 ? "" : "s"}`

    input.setAttribute(
      "aria-activedescendant",
      visible.length > 0 ? `palette-option-${active}` : "",
    )
  }

  const update = () => {
    visible = matches(input.value.trim().toLowerCase())
    active = 0
    render()
  }

  const move = (delta) => {
    if (visible.length === 0) return
    active = (active + delta + visible.length) % visible.length
    render()
    document.getElementById(`palette-option-${active}`)?.scrollIntoView({ block: "nearest" })
  }

  const choose = () => {
    const item = visible[active]
    if (item) window.location.assign(item.url)
  }

  const open = () => {
    if (!dialog.open) dialog.showModal()
    input.value = ""
    input.focus()

    void load().then((loaded) => {
      items = loaded
      visible = items.slice(0, LIMIT)
      active = 0
      render()
    })
  }

  input.addEventListener("input", update)

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      move(1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      move(-1)
    } else if (event.key === "Enter") {
      event.preventDefault()
      choose()
    }
  })

  list.addEventListener("click", (event) => {
    const target = event.target.closest("li")
    if (!target?.id) return

    const index = Number(target.id.replace("palette-option-", ""))
    const item = Number.isNaN(index) ? undefined : visible[index]
    if (item) window.location.assign(item.url)
  })

  dialog.addEventListener("close", () => {
    input.value = ""
  })

  window.addEventListener("palette:open", open)
})()
