---
title: "Writing My Own (Shitty) Version of Executor"
description: "I tried building my own executor"
date: "Apr 7 2026"
draft: true
---

Im sure youve heard of cloudflare codemode mcp
And if you haven't checked out executor.sh, this is basically local version of that
Theo also has an excellent video about the topic here

Anyway this article won't really talk about code mode or execution layer itself
This article will talk mostly about me, my "gripe" with executor + playwriter, my attempt at writing a similar thing, and realized that executor is the way it is, because well, it has to be the way it is
Basically I practiced https://www.neverjust.net/ by doing lol

## My gripe with executor + playwriter

Codemode is awesome
Playwriter is awesome
Executor is awesome 

the way playwriter mcp works is by the agent writing typescript code that's injected with browser state and stuff. Basically codemode

And the way executor works is the agent writing code, injected with tools that follows the supported schema (openapi graphql mcp, there might be more coming) . again basically codemode

whatd you get when putting a codemode on top of a codemode?

Ew
Wtf is that

the agent might do it well, but idk, i dont like seeing code inside strings

## my attempt at creating a "better" executor

Why dont we combine playwriter into executor directly?
We can just inject browser object inside it, surely itll work just fine (spoiler alert not its not)

so my idea was
core is just code -> exec -> result
everything else is plugin

need to add openapi tools? use fromOpenAPI() and youre good!
need to inject playwriter like browser? write an extension for that
typescript support?
intercepting logs?
search tool?
switching between different runtime? (this one doesnt really work)

EVERYTHING is plugin

---

of course as you can see this is what im most excited about
which in hindsight is uh, wrong the approach. really shouldve focused on securing the runtime

I designed the api, looked at pi and opencode extensions for inspirations. What hooks should be exposed? what context are provided? What can be modified? What about switching runtimes? What do I need to expose?

Overall I'm pretty happy with how the plugin api is designed, even though I basically copied and pasted from opencode

BUT THAT DOESNT FUCKING MATTER LMAO

## why executor is complex

lemme explain to you how the security model(?) works in this kinda thing (you running untrusted ts code, controlled by nodejs host)

1. you want the runtime to have the least permission possible. deno is a good example where you can just not allow things
2. you want memory isolation so the untrusted code cant mess with the things inside nodejs host. you can use isolate, or completely different process for this (isolated by the OS)

This is how I run the untrusted code in my own version of executor

as you can see, security is practically.... nonexistent

---

I knew this isnt secure at all but my mind went like "oh yeah i'll figure this out later, my thing is about extensions"

and of course when I get to this problem, I genuinely have no idea what to do. so my solution was to just "claude clone executor and see how it does things"
what i get back, was this

1. it creates a js proxy for tools inside the untrusted code
2. untrusted code calls the tools
3. proxy intercept, communicate with host via ipc
4. proxy returns the real value

this is fucking brilliant, no way in hell i would ever come up with that solution
that said it comes with a few limitations

1. async proxy via ipc only supports function

well it kinda supports property access via async get()

but then when accessing an object property the code would look like

const name = await object.name

which is weird
the agent wouldnt really get used to it, i dont think, i dont know, i did not actually write an eval and executor doesnt work like that so who cares alright

so thats why every tools is a method call, no property access

2. the ipc can only pass around serializable object

i mean, duh
you dont expect you can send a function to a server to execute
same thing here
closures arent serializable
what if you include an in scope variable but is actually defined outside the function
howd the server know about that? same here
you just cant

and what about something like this

const button = page.locator(button)

can you send back button to the untrusted code? no you cant
button contains both properties and methods
well yes you can serialize it as object and properties
but what about the methods? you cant really do that
and this is part of playwright api design, so yeah, kinda sad in that regard

---

So after learning that, what did I do?
Well, I tried everything that I know

I tried
- node:vm, not actually secure
- isolated-vm, still cant pass playwright objects around
- node:worker with Atomics.wait, same thing, needs serializable object
- Deno child process, even harder IPC
- Forking a JS engine and modify it to somehow support async get() proxy? Well I considered this but you still cant pass around objects

My idea didnt really make any sense
You can't have "secure" with "able to meddle around with host's memory"

And that is when I think perhaps executor went and tried the same thing, found out the limitation, and decided on current design
Or maybe Rhys knew what was possible, what was not. What was secure and what wasnt. Or any other consideration whatever
What I definitely learned is Executor wasnt written the way I wrote it because, well, mine kinda sucks

Its not secure
I like the extension api and design
But its not secure
Theres not really any point of using it if its not secure

Whats the bottom line?
I guess, never just

But if you want to learn stuff the hard and time wasting way, go on
tbh its kinda fun

just use executor