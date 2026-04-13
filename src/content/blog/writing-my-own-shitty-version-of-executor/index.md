---
title: "Writing My Own (Shitty) Version of Executor"
description: "I tried building my own executor"
date: "Apr 14 2026"
draft: false
---

I'm sure you've heard of Cloudflare Codemode MCP.
And if you haven't checked out [Executor](https://executor.sh/), it's basically a local version of that.

Theo also has an excellent video about the topic [here](https://www.youtube.com/watch?v=TilDSWeiAlw).

Anyway, this article won't really talk about Codemode or the concept of an execution layer itself.

This article will talk mostly about me, my "gripe" with Executor + Playwriter, my attempt at writing a similar thing, and realizing that Executor is the way it is, because, well, it has to be the way it is.

I think I [never just](https://www.neverjust.net/)-ed myself lol.

## My Gripe With Executor + Playwriter

Codemode is awesome.

Playwriter is awesome.

Executor is awesome.

The way Playwriter MCP works is by letting the agent write TypeScript code that's injected with browser state and stuff. Basically the same idea as Codemode.

And the way Executor works is by letting the agent write TypeScript code, injected with tools (OpenAPI, GraphQL, Other MCPs, etc.). See the similarity? This is basically another Codemode.

What do you get when putting a Codemode on top of a Codemode?

```typescript
console.log("Page Snapshot");

const result = await tools.playwriter.execute({
  code: `
    // Use the page from previous execution or get a new one
    const page = context.pages().find(p => p.url() === 'https://example.com/');
    if (!page) {
      console.log("Page not found, navigating...");
      state.page = await context.newPage();
      await state.page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
    } else {
      state.page = page;
    }
    
    // Get full page snapshot
    const snap = await snapshot({ page: state.page, showDiffSinceLastCall: false });
    console.log(snap);
    
    // Get page content as markdown
    console.log("\\n--- Page Markdown ---");
    const md = await getPageMarkdown({ page: state.page, showDiffSinceLastCall: false });
    console.log(md);
  `,
});

console.log(result);
```

That's a code string inside of another code string.

The agent might still be able to do it well, but IDK, feels brittle to me. One wrong quote escape and it's a syntax error.

## My Attempt at Creating a "Better" Executor

Why don't we combine Playwriter into Executor directly?

We can just inject the `browser` object inside it. Surely it'll work just fine (spoiler alert: no, it won't)

---

So the idea was:

- Core is just `code -> exec -> result`
- Everything else will be a plugin

Need to add OpenAPI tools? Use `fromOpenAPI()` and you're good!

```typescript
// .runner/config.ts
import { defineConfig } from "@ericc-ch/runner";
import { fromOpenAPI } from "@ericc-ch/runner/openapi";
export default defineConfig({
  plugins: [
    // Plugin that generates API client from OpenAPI spec
    fromOpenAPI("https://example.com/openapi.json", {
      baseUrl: "https://api.example.com/v1",
      headers: {
        Authorization: "Bearer token",
      },
      operations: ["listUsers", "getUser", "createUser"], // Optional whitelist
    }),
  ],
});

// When the runner executes code, the context now has:
{
  api: {
    listUsers: Function & { description: "List all users", input: {...} },
    getUser: Function & { description: "Get user by ID", input: {...} },
    createUser: Function & { description: "Create a new user", input: {...} },
    description: "Generated client for Example API (https://example.com/openapi.json)",
    meta: { specVersion: "3.0.0", operations: ["listUsers", "getUser", "createUser"] }
  }
}
```

Need to inject a Playwriter `browser`? Write an extension for that.

```typescript
// .runner/plugins/playwright.ts
import * as playwright from "playwright";
import type { Plugin, RunInput } from "@ericc-ch/runner";
interface PlaywrightPluginOptions {
  headless?: boolean;
  browser?: "chromium" | "firefox" | "webkit";
}
export const playwrightPlugin =
  (options: PlaywrightPluginOptions = {}): Plugin =>
  async () => {
    const { headless = true, browser = "chromium" } = options;
    // Initialize browser at plugin load time (once per session)
    const browserInstance = await playwright[browser].launch({ headless });
    const context = await browserInstance.newContext();
    const page = await context.newPage();
    return {
      // Inject browser objects into the execution context
      beforeRun: async (_input: RunInput) => ({
        context: {
          browser: Object.assign(browserInstance, {
            description: "Playwright browser instance (shared across runs)",
          }),
          context: Object.assign(context, {
            description:
              "Browser context for this execution (isolated cookies/storage)",
          }),
          page: Object.assign(page, {
            description: "Playwright page for browser automation",
          }),
        },
      }),
      // Cleanup when runner shuts down
      teardown: async () => {
        await browserInstance.close();
      },
    };
  };

// .runner/config.ts
import { defineConfig } from "@ericc-ch/runner";
import { playwrightPlugin } from "./plugins/playwright.ts";
export default defineConfig({
  plugins: [playwrightPlugin({ headless: false })],
});

// Agent's code
await page.goto("https://example.com");
await page.click("text=Sign in");
await page.fill("input[name='email']", "user@example.com");

const title = await page.title();
const items = await page.$$eval(".product", (els) =>
  els.map((el) => el.textContent)
);

await page.screenshot({ path: "result.png" });
```

TypeScript support? (Foreshadowing alert)

```typescript
// src/builtins/executor-new-fn.ts
import { transformSync } from "amaro";
import type { Executor, Plugin } from "@ericc-ch/runner";

export const typescriptExecutor = (): Plugin => async () => ({
  executor: {
    name: "typescript",
    async execute({ code, context }) {
      const wrapped = `(async () => {\n${code}\n})()`;
      const { code: js } = transformSync(wrapped, { mode: "strip-only" });
      const fn = new Function(...Object.keys(context), `return ${js}`);
      return await fn(...Object.values(context));
    },
  },
});
```

Intercepting logs? Search tool? Switching between different runtimes? (This one doesn't really work)

EVERYTHING is a plugin.

> I found out that Executor also ended up with a similar plugin approach: [GitHub link](https://github.com/RhysSullivan/executor/tree/main/packages/plugins/openapi)

---

This is what I'm most excited about. Which, in hindsight, is uh... kinda stupid. Really should've focused on securing the runtime.

I looked at Pi and OpenCode plugin APIs for inspiration. What hooks should be exposed? What context is provided? What can be modified? What about switching runtimes? What do I need to expose?

Overall I'm pretty happy with how the Plugin API is designed, even though I basically copied and pasted from OpenCode.

BUT THAT DOESN'T FUCKING MATTER LMAO.

## Why Executor is Complex (And Why Mine Doesn't Work)

Let me explain to you how the security model(?) works in this kinda thing (running untrusted TypeScript code, controlled by a Node.js host).

1. You want the runtime to have the least permission possible. Deno is a good example where you can just not allow things.
2. You want memory isolation so the untrusted code can't mess with the things inside the Node.js host. You can use a v8 isolate, or a completely different process for this (isolated by the OS).

This is how I run the untrusted code in my own version of executor:

```typescript
import { transformSync } from "amaro";
import type { Executor, ExecutorInput, RunOutput } from "../lib/types.ts";

export const executorNewFn: Executor = {
  name: "executorNewFn",
  async execute({ code, context }: ExecutorInput): Promise<RunOutput> {
    const wrappedCode = `(async () => {\n${code}\n})()`;
    const { code: strippedCode } = transformSync(wrappedCode, {
      mode: "strip-only",
    });

    const fn = new Function(...Object.keys(context), `return ${strippedCode}`);
    const result = await fn(...Object.values(context));

    return { result };
  },
};
```

This is the same as the TypeScript plugin above.
As you can see, security is practically... nonexistent.

---

I knew this wasn't secure at all but my mind went like "Oh yeah, sure, I'll figure this out later. My thing is all about extensions!"

> Did I mention that Executor also ended up with a similar plugin approach? [GitHub link](https://github.com/RhysSullivan/executor/tree/main/packages/plugins/openapi)

And of course when I got back to this problem, I genuinely had no idea what to do. So my first thought was to just "Claude, clone executor.sh and see how it does things."

What I got back was this (don't worry I did double-check, I don't 100% trust my clanker):

1. It creates a proxy for the `tools` object inside the untrusted code.
2. Untrusted code calls the methods inside `tools`.
3. Proxy intercepts, communicates with the host via IPC.
4. Proxy returns the real value to the untrusted code.

My mind was blown, it fucking exploded. This is brilliant, no way in hell I would ever come up with that solution.

That said, it does come with a few limitations:

1. Async Proxy via IPC only supports functions. Sort of.

Well, it kinda supports property access via async `get()`.

But then, when accessing an object property, the code would look like:

```typescript
// Without async get():
const width = page.viewportSize.width;

// With async get():
const viewportSize = await page.viewportSize;
const width = await viewportSize.width;
```

Which IMO is weird.

The agent won't really get used to it. I don't think. I don't know. I did not actually write an eval and Executor isn't really meant to work like that so that's not really the point.

That's why in Executor, every tool is a method call, no property access on `tools`:

```typescript
const sources = await tools.executor.sources.list();
console.log(
  "Sources:",
  sources.map((s) => s.name)
);

const search = await tools.search({ query: "list" });
console.log("Search results:", search.length);

return { sources: sources.length, searchResults: search.length };
```

2. The IPC can only pass around serializable objects.

I mean, duh.

You can't pass over a function using JSON. Same thing applies here.

What if you include a variable that is in scope, but is actually defined outside the function? How'd the server know about that?

```typescript
const multiplier = 3;
// This function captures `multiplier` from outer scope
const multiply = (x) => x * multiplier;
// Try to send it over IPC...
sendToOtherProcess(multiply);
// On the other side, `multiplier` doesn't exist.

// The other process receives a function that references `config`,
// but `config` was never serialized.
const config = { apiKey: "secret123" };
const makeRequest = (url) =>
  fetch(url, { headers: { Authorization: config.apiKey } });
```

You just can't.

Well, at least we can do something like this, right? Surely we can serialize a Playwright `Locator`.

```typescript
const button = page.locator(button);
```

No. No you can't. `button` contains both properties and methods.

Well, yes, you can serialize it as an object and omit all the properties. But at that point, why use Playwright? The Playwright API is designed so you can do something like:

```typescript
await page.getByLabel("User Name").fill("John");
```

---

After learning all of that, what did I do?
Well, I tried everything that I knew.

I tried:

- `node:vm`. Not actually secure.
- [`isolated-vm`](https://npmjs.com/package/isolated-vm). Still can't pass Playwright objects around.
- `node:worker` with `Atomics.wait`. Same thing, needs serializable objects.
- Deno with `node:child_process`. Same thing.
- Forking a JS engine and modifying it to somehow support async `get()` proxy? Well, I considered this but you still can't pass around objects.

My idea didn't really make any sense in the first place.
You can't have "secure" with "able to meddle around with the host's memory".

And that is when I thought perhaps Executor went and tried the same thing, found out about the limitations, and decided on the current design. Or maybe Rhys knew what was possible and what was not, what was secure and what wasn't, beforehand. What I definitely learned is Executor wasn't designed the way I did it because, well, mine kinda sucks. It's not secure.

> But do you know that Executor also ended up with a similar plugin approach while still being more secure? [GitHub link](https://github.com/RhysSullivan/executor/tree/main/packages/plugins/openapi)

I liked the extension API and design. But it's still not secure. There's not really any point of using it if it's not secure.

What's the bottom line?
I guess, [never just](https://www.neverjust.net/).

But if you want to learn stuff the hard and time-wasting way, go on.
TBH it was kinda fun.

Just use [Executor](http://executor.sh/).
