# Renderball for your AI

Renderball turns a deck your AI writes into a designed, animated, editable
presentation. This repository holds the files that plug Renderball into the
tools an AI runs in. The product itself lives at https://renderball.com.

## Install

**Skill** — Claude Code, Codex, Cursor, Gemini CLI and any agent that reads skills:

    npx skills add Renderball/renderball-skills

**Claude plugin** — Claude on the web, the Claude app, Cowork and Claude Code
(paid Claude plans). It brings the studio's method, a deck command (`/renderball-deck` in Claude, `/renderball:deck` in Claude Code) and the
connection, which signs you in with your Renderball account the first time.

- Claude on the web or the app: Customize → Plugins → + → Add marketplace →
  `Renderball/renderball-for-claude`, then install **renderball**.
- Claude Code:

      /plugin marketplace add Renderball/renderball-for-claude
      /plugin install renderball@renderball

**Gemini CLI extension:**

    gemini extensions install https://github.com/Renderball/renderball-skills

**MCP server**, any client: `https://renderball.com/api/mcp` — setup at
https://renderball.com/docs/agents. No key needed to try; a key from
https://renderball.com/account lifts the guest limits.

**Agent toolkit** for the Vercel AI SDK, the OpenAI Agents SDK or any tool
loop: the `@renderball/agent-toolkit` package on npm, source in
`packages/agent-toolkit`.

## No setup at all

An AI that can make web requests needs none of the above: the recipe at
https://renderball.com/for-ai (also `/llms.txt`) is three steps, and the deck
comes back as one link.

## What is here

| Path | What it is |
| --- | --- |
| `skills/renderball-deck` | the skill |
| `plugins/renderball` + `.claude-plugin/marketplace.json` | the plugin and its marketplace |
| `gemini-extension.json` + `GEMINI.md` | the Gemini CLI extension |
| `server.json` | the entry for the official MCP registry |
| `packages/agent-toolkit` | the npm package source |

This repository is generated from Renderball's product repository by a sync
script; changes are made there and published here. MIT licensed.
