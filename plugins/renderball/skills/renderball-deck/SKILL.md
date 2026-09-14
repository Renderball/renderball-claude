---
name: renderball-deck
description: Build a designed, animated, editable presentation on Renderball (renderball.com) from a brief — you write the outline and the deck file, Renderball checks, renders and hosts it, the user edits it in the browser. No account or key needed to start. Use when a user asks for a deck, slides, a pitch or a presentation.
---

# Build a deck on Renderball

Renderball turns a deck **you write** into a designed, animated, editable
presentation the user finishes in the Renderball editor. Three steps, no
setup. The live recipe is always at https://renderball.com/llms.txt — if
anything here disagrees with it, the live one wins.

## Rules

- Never invent numbers, quotes or claims. Renderball's truth check flags
  anything not in the user's material. Ask for missing figures.
- Declare the brand you actually know (name, hex colours, font names, a
  public logo image, the voice). Never guess a colour — leave it out and the
  deck uses neutral styling.
- Keep the `guest_token` from step 1 and send it with every later request.
- When the deck is ready, give the user `deck_url` and nothing else: it
  shows the deck, and its Edit button signs them in and makes it theirs.

## 1. Start the deck with the brand and your outline

```bash
curl -s -X POST https://renderball.com/api/agent/decks \
  -H 'Content-Type: application/json' \
  -d @start.json
```

`start.json`:

```json
{
  "brief": "What the deck is for, who it is for, what it should argue and ask.",
  "pages": 5,
  "tone": "optional",
  "brand": {
    "name": "Brand name",
    "website": "their-site.com",
    "accent": "#0f62fe",
    "fonts": { "headline": "Family, if known", "body": "Family, if known" },
    "logo_url": "https://…/logo.svg",
    "voice": "How the brand speaks, optional"
  },
  "outline": [
    { "label": "…", "description": "…", "visual_concept": "…",
      "content": { "eyebrow": "…", "headline": "…", "lede": "…", "bullets": ["…"], "caption": "…" } }
  ]
}
```

Only `name` is required inside `brand`; every page needs a `headline`;
1 to 16 pages. The reply has `deck_id`, `guest_token`, `deck_url` and
`writing_brief`.

## 2. Write the COMPLETE deck file exactly as `writing_brief` says, then send it

```bash
curl -s -X POST "https://renderball.com/api/agent/decks/<deck_id>/file?guest_token=<guest_token>&wait=45" \
  -H 'Content-Type: text/plain' --data-binary @deck.tsx
```

The reply is `ready` (with `deck_url`), `importing`, or `failed` with the
reason — fix the file and send it again.

## 3. If it said importing, poll until ready

```bash
curl -s "https://renderball.com/api/agent/decks/<deck_id>/status?guest_token=<guest_token>"
```

Every 10 seconds. Then hand the user `deck_url`.

## Have a Renderball API key?

Send `Authorization: Bearer rb_live_…` instead of `guest_token`: the deck
lands in that account with no limits. Your user creates a key at
https://renderball.com/account and can connect you permanently:
https://renderball.com/docs/agents (the MCP server is
https://renderball.com/api/mcp).

## Limits

Decks made without an account are limited per day, take a bounded number
of imports, and expire after a few days unless the user signs in and
claims them.
