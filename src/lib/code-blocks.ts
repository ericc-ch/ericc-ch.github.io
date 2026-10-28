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

const codeBlocks = {
  name: "code-blocks",
  element: {
    filter: ["pre"],
    visit(node: HastElement, ctx: VisitorContext): void {
      const language = languageOf(node)
      const cloned: HastElement = {
        type: "element",
        tagName: "pre",
        properties:
          node.properties?.tabIndex === undefined
            ? { ...node.properties, tabIndex: 0 }
            : { ...node.properties },
        children: node.children ?? [],
      }

      ctx.replaceNode(
        node,
        element("figure", { className: ["code"] }, [
          element("figcaption", {}, caption(language)),
          cloned,
        ]),
      )
    },
  },
}

export default codeBlocks
