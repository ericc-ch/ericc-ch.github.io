type HastProperties = Record<string, unknown>

type HastElement = {
  type: "element"
  tagName: string
  properties?: HastProperties
  children?: Array<HastNode>
}

type HastText = { type: "text"; value: string }

type HastNode = HastElement | HastText

type VisitorContext = {
  replaceNode: (node: HastElement, replacement: HastElement) => void
}

function element(
  tagName: string,
  properties: HastProperties,
  children: Array<HastNode>,
): HastElement {
  return { type: "element", tagName, properties, children }
}

function text(value: string): HastText {
  return { type: "text", value }
}

function languageOf(pre: HastElement): string {
  const properties = pre.properties ?? {}
  const direct = properties.dataLanguage ?? properties["data-language"]
  if (typeof direct === "string" && direct.length > 0) return direct

  for (const child of pre.children ?? []) {
    if (child.type !== "element") continue

    const classes = child.properties?.className
    if (!Array.isArray(classes)) continue

    for (const value of classes) {
      if (typeof value === "string" && value.startsWith("language-")) {
        return value.slice("language-".length)
      }
    }
  }

  return ""
}

function caption(language: string): Array<HastNode> {
  const nodes: Array<HastNode> = []

  if (language) nodes.push(element("span", {}, [text(language)]))

  nodes.push(
    element(
      "button",
      {
        type: "button",
        className: ["copy"],
        dataCopy: "",
        ariaLabel: language ? `Copy ${language} code` : "Copy code",
      },
      [text("Copy")],
    ),
  )

  return nodes
}

/** Shallow clone, so the replacement never contains the node it replaces. */
function clone(node: HastElement): HastElement {
  return { ...node, children: node.children ?? [] }
}

const codeBlocks = {
  name: "code-blocks",
  element: {
    filter: ["pre"],
    visit(node: HastElement, ctx: VisitorContext): void {
      const language = languageOf(node)

      // Shiki already gives the pre tabindex="0" so it can be scrolled from the keyboard.
      // Setting it again here emits a duplicate attribute, which is invalid HTML.
      ctx.replaceNode(
        node,
        element("figure", { className: ["code"] }, [
          element("figcaption", {}, caption(language)),
          clone(node),
        ]),
      )
    },
  },
}

const tableBlocks = {
  name: "table-blocks",
  element: {
    filter: ["table"],
    visit(node: HastElement, ctx: VisitorContext): void {
      // A scroll container of its own, so a wide table scrolls instead of moving the page.
      // tabindex makes it reachable without a keyboard-only dead end.
      ctx.replaceNode(node, element("div", { className: ["table"], tabIndex: 0 }, [clone(node)]))
    },
  },
}

export default [codeBlocks, tableBlocks]
