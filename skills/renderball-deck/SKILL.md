---
name: renderball-deck
description: Make an animated, editable presentation on Renderball (renderball.com). Use when the user asks for a deck, slides, a pitch or a presentation. You find each page's picture with the studio's method, write the deck, look at the rendered pages and fix them; the user finishes it by hand in the Renderball editor and shares it with one link.
---

# Make a deck on Renderball

Renderball turns a deck **you write** into a designed, animated, editable
presentation. You write the story and every page; Renderball checks, renders
and hosts it; the user opens it in the Renderball editor, changes anything by
hand, and comes back to you for bigger changes.

## Rules

- Never invent numbers, quotes or claims. Renderball's truth check compares
  the figures on the pages with the brief and outline you send, so put the
  user's real figures there. Ask the user for missing figures instead of
  guessing.
- The brand: if you can open the brand's website, **read its real colours
  and fonts there** and declare them: the lead colour is usually the main
  buttons and the large coloured areas, not the link colour; note the page
  background and text colours and the font family names. Reading the site is
  not guessing; inventing a colour is, so never do that. **Always give the
  website too**: when you leave the colours out, Renderball reads the site for
  its palette, fonts and logo.
- Story first: agree the outline with the user before writing pages when the
  brief leaves room for doubt.
- When the deck is ready, give the user its one link and tell them they can
  edit it by hand there, or ask you for changes.

## The studio's method

Every page is built around ONE picture that IS its idea. This is how to find it.

THE STUDIO'S METHOD — how our founder finds a page's picture, in his words:
"The first thing is I reflect, before anything, on what I can see when I think of this idea. It's like a memory thing — trying to bring up images in my mind of the idea, or of the multiple ideas in the text. Then I take those images and make them work on the slide."

Do this for every page, in your thinking, BEFORE you plan any layout:
1. Decide whether the page's claim is ABSTRACT (a quality: speed, growth, trust, scale, simplicity) or CONCRETE (a product, an object, a screen, a document, a place).
2. Ask: what can I see when I think of this? List six to eight pictures from the real world — scenes, objects, moments — and what moves in each. At least two must be far-fetched.
3. ABSTRACT: choose the picture that IS the claim — a stranger should get the claim from the picture alone, without the headline (a race car is speed; a map filling up is time passing). CONCRETE: the picture is the thing itself — list the details that must be exactly right (shape, proportions, the brand's real colours, type and names) and get every one right: no mistakes, no brand mismatch.
4. Write the page's direction in one sentence: the thing, the motion that acts out the claim, one craft detail.
5. Build the page from that sentence: the picture takes the stage and the type works around it. Never use the same picture on two pages of a deck.

Begin every page's Section component with its direction — step 4 of THE STUDIO'S METHOD — as a one-line comment: // Direction: <the thing, the motion that acts out the claim, one craft detail>.

## With the Renderball connector

The Renderball plugin connects it for you (`https://renderball.com/api/mcp/account`);
the user signs in with their Renderball account in the browser the first
time. Their deck lands in their account, and the editor link is theirs.

If the Renderball tools are not available, the connector is not connected
yet. Tell the user exactly where to fix it: in Claude, **Customize → Plugins →
Renderball → Connectors → Connect**, then sign in with Renderball; in Claude
Code, `/mcp` → renderball. Draft the outline meanwhile, but do not describe a
deck as made until the tools have made it.

Write the deck the way the studio's own writer does: **one page at a time,
each with your full attention.** Page 1 first, because it sets the deck's
whole design system; every other page continues page 1's file.

1. **create_deck** with the brief, the brand, and your outline, one entry per
   page (every page needs a headline).
2. **Each reply carries the brief for the next page:** its place in the outline,
   the example pages chosen for it, and the file format to write it in. Study
   the examples, follow the method, write that page to its brief and send it
   with **submit_page**. Page 1 holds every shared colour, helper and piece of
   chrome.
3. If you can run helpers in parallel (the plugin's `page-writer` agent in
   Claude Code and Cowork), each helper takes its own page's brief with
   **get_page_brief** and does the same.
4. **When the last page is in**, the deck is merged, checked and rendered. The
   reply carries the rendered pages (**see_deck** shows them any time) and
   anything our checks flagged. Fix those, and anything overlapping, clipped,
   off its page or not saying the page's claim, by sending the changed pages
   with **submit_page**.
5. **Hand over** the editor link.

Also: **list_decks** (the user's decks), **write_outline** (change an existing
deck's outline) and **share_deck** (a public link anyone can open — only when the user asks to
share).

## Without the connector

An AI that can make web requests can use the same flow without signing in.
The same recipe is published at https://renderball.com/llms.txt.

1. `POST https://renderball.com/api/agent/decks` with JSON
   `{"brief", "pages", "brand": {"name", …}, "outline": [{"headline", …}]}`.
   The reply has `deck_id`, `guest_token`, `deck_url` and `writing_brief`.
2. Write the complete file as `writing_brief` says and send it:
   `POST https://renderball.com/api/agent/decks/<deck_id>/file?guest_token=<guest_token>&wait=45`
   with the file as `text/plain`. The reply is `ready`, `importing`, or
   `failed` with the reason: fix the file and send it again.
3. If it said importing, poll
   `GET https://renderball.com/api/agent/decks/<deck_id>/status?guest_token=<guest_token>`
   every 10 seconds, then give the user `deck_url`.

Decks made without an account are limited per day and expire after a few
days unless the user signs in (free) from the deck's Edit button.
