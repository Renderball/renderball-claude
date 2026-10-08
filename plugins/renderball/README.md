# Renderball for Claude

Make animated, editable presentations with Claude. Claude writes the deck one
page at a time, each page built around one picture that carries its idea, and
Renderball checks, renders and hosts it. You get one link: open it to change
anything by hand in the Renderball editor, or ask Claude for bigger changes.

## Use it

- **Claude on the web or the app:** type `/renderball-deck` and your brief, or
  ask for a deck made with Renderball.
- **Claude Code and Cowork:** `/renderball:deck` and your brief.
- The first time, Claude asks you to connect Renderball: sign in with your
  Renderball account (Customize → Plugins → Renderball → Connectors → Connect).

## Example prompts

- "Make a 6-page seed pitch deck with Renderball for our app, for seed investors: …"
- "Turn these meeting notes into a 5-page investor update with Renderball."
- "List my Renderball decks."
- "Show me the pages of my latest Renderball deck."
- "Share my latest Renderball deck so I can send it to my cofounder."

## What is sent where

The plugin runs nothing on your computer: it is a skill, a deck command, a
page-writer helper and the connection. It connects Claude to
`https://renderball.com/api/mcp/account`, signed
in with your Renderball account. Claude sends your brief, the brand details and
website you give, the outline and each page's code. When no brand colour is
given, Renderball reads that website for the colours, fonts and logo. It renders
the pages and sends the page briefs, the rendered pages and the links back to
Claude. Your decks
stay private in your account; `share_deck`, which Claude uses only when you ask,
makes a deck viewable by anyone with its link.

- Privacy: https://renderball.com/privacy
- Terms: https://renderball.com/terms
- Support: support@renderball.com
