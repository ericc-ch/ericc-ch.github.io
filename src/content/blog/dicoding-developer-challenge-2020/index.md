---
title: "Things I learned From Participating in a Developer Challenge"
description: "My first dip into the world of competitive programming"
date: "14 Nov 2020"
draft: false
---

There’s this [challenge](https://www.dicoding.com/challenges/637) found by my friend, held by Dicoding Indonesia. One of the theme was to grow the tourism sector. So here’s what is in our brain:

1. Uber/Gojek clone, but with tour guides instead of driver.
2. Pinterest clone, but only for tourism destination photos.

![Flutter logo](https://miro.medium.com/max/875/1*0h8e7K6qsIG6fv7BchwHEg.png)

Flutter was our initial decision because there are three of us, and two are flutter developer. Yes, I’m the only one who uses React. But I wrote an app using Flutter once, so it’s really a big deal.

Until I realized that:

1. This challenge has a 40 days deadline
2. That app that I once wrote was just a timer with a switch
3. I’m in a middle of an internship

Yeah, let’s just play it safe. I’ll just develop the web version using React, and call it a multi-platform app.

At that time, I recently found [this article](https://medium.com/superhighfives/an-almost-static-stack-6df0a2791319). and I though I’ll just use it for this project. CRA with TypeScript + React Router + React Snap + React Helmet and Tailwind for styling.

Here’s what my first design for the Pinterest clone looks like:

![My first design](https://miro.medium.com/max/875/1*9TKzyExRmqVhOgzr8u9ymQ.png)

It’s in Indonesian Language.

What’s that bell button for? Why is it only displaying 2 images at a time? Why is there a back button? Is it not gonna be on the home page?

I don’t know, I just mimicking the design of the mobile version of the app.

Why? I don’t know. I feel kinda stupid and changed the design.

![](https://miro.medium.com/max/875/1*5k16lkfqg95XRMjkGIuIMg.png)

Better isn’t it?

Now you can clearly see how many pages are there. Also that search bar is now smaller. Bell button? removed.

But it still only displaying 2 (and a half) images at a time. And I didn’t even think about larger screen, so if you’re browsing the site on a desktop, use a phone instead.

No, I’m kidding. But I was kinda stressed there. What’s the point of a multi-platform app if you can only use it on a phone?

So here comes my third revision:

![](https://miro.medium.com/max/875/1*KZy1n48QfoEawrkDgIydzQ.png)

I decided that I’ll work on the homepage later, while also changing the tech stacks that I used

1. Next instead of the earlier static stack. Because it’s easier to setup.
2. Chakra UI instead of Tailwind. Because I don’t know how to create a good user experience.

And also I have to rewrite the app.

But it’s okay though, rather than having a bad user experience because of my mediocre skills at CSS, why not use a pre-made UI Kit (Also, deadline).

After I’m done with the login and register page, it’s time to face the true boss.

Home page.

First, I thought Chakra UI has some kind of Navigation. But boy I was hella wrong. I had to make my own Navigation Bar using its Box Component. Actually I just have to put a few icons in a box. What’s hard about that?

![](https://miro.medium.com/max/3840/1*rc9w51X0UZZJSec2zwy__g.png)

![](https://miro.medium.com/max/3840/1*iDPNdDLUqF0VeVADQBtygg.png)

Seems familiar?

Yes it was kinda easy, mostly because I shamelessly stole the design from [fireship.io](https://fireship.io/)

Then here’s the hard part: Make a pictures list, infinite scrolling with great performance.

I’ve heard of [React Virtualized](https://github.com/bvaughn/react-virtualized), but never used it. So I decided that this app will be the experiment lab.

I didn’t understand the documentation. Like, at all. I don’t understand it at all.

I wanted to use the Masonry Component, and here’s what it says in the Masonry docs:

> Overview
>
> Measuring and layout
>
> Rendering occurs in two phases:
>
> Phase 1: Measurement
>
> This phase uses estimated cell sizes (provided by the `cellMeasurerCache` property) to determine how many cells to measure in a batch. Batch size is chosen using a fast, naive layout algorithm that stacks images in order until the viewport has been filled. After measurement is complete (`componentDidMount` or `componentDidUpdate`) this component evaluates positioned cells in order to determine if another measurement pass is required (eg if actual cell sizes were less than estimated sizes). All measurements are permanently cached (keyed by `keyMapper`) for performance purposes.
>
> Phase 2: Layout
>
> This phase uses the external `cellPositioner` to position cells. At this time the positioner has access to cached size measurements for all cells. The positions it returns are cached by `Masonry` for fast access later.
>
> Phase one is repeated if the user scrolls beyond the current layout’s bounds. If the layout is invalidated due to eg a resize, cached positions can be cleared using `recomputeCellPositions()` or `clearCellPositions()`.

Huh? I guess I have to learn the list component first to get the basic of this?

> List
>
> This component renders a windowed list (rows) of elements. It uses a `Grid` internally to render the rows and all props are relayed to that inner `Grid`. That means that `List` also accepts `Grid`[ props](https://github.com/bvaughn/react-virtualized/blob/master/docs/Grid.md) in addition to the props shown below.
>
> Prop Types\
> (…)

Uh… that’s it about the overview?

> I’ll just read [this tutorial](https://blog.logrocket.com/rendering-large-lists-with-react-virtualized-82741907a6b3/). — Erick Christian, 2020

Ok, now I know how to make a list. How does that apply to a Masonry? I don’t know.

But still, I tried it. And the result was… nothing. It showed nothing (Unfortunately the screenshot was deleted). My brain was already overheated there.

Until I found this [library](https://www.npmjs.com/package/masonic).

AND HELL THAT WAS A LIFESAVER.

Just list your item there, and boom. It just works. (No screenshot either)

Not really done, but I guess I’ll continue this story later.

Here’s what I learned so far:

1. I should’ve just used Flutter because this is just a challenge
2. I know how to use Next and React Virtualized (even though only the basics)
3. I know how to deploy a Next app to Netlify
4. Must know how to CSS if you use Tailwind

What do you guys think?

Anyway, thanks for reading. Cheers.
