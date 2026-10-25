---
title: "Noxtara MCP & CLI"
description: "MCP server and CLI for the Noxtara security platform"
date: "May 13 2026"
demoURL: "https://www.npmjs.com/package/@noxtara/cli"
repoURL: "https://github.com/xcidic/noxtara-mcp"
draft: false
---

Built at Xcidic for Noxtara. The Noxtara frontend was a team effort, but these two I built myself.

**noxtara-mcp** is an MCP server that exposes ~226 Noxtara API endpoints as tools for ChatGPT, Claude, Cursor, and local agents. Works over HTTP and stdio, authenticated with a personal access token.

**@noxtara/cli** runs SCA, SAST, and mobile scans from the terminal or GitHub Actions, configured with a `noxtara.yaml` file.
