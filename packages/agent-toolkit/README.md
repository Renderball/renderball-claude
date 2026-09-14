# @renderball/agent-toolkit

Give any AI agent the ability to build a designed, animated, editable
presentation on [Renderball](https://renderball.com). Your agent writes the
outline and the deck; Renderball checks every claim against the brief,
renders it with motion, and hands back one link. The user edits it in the
browser. No account is needed to start.

```ts
import { createRenderball, renderballTools, toVercelAiTools } from "@renderball/agent-toolkit";
import { tool, jsonSchema, generateText } from "ai";

const rb = createRenderball(); // add { apiKey: "rb_live_…" } to land decks in an account
const tools = toVercelAiTools(renderballTools(rb), { tool, jsonSchema });

await generateText({ model, tools, prompt: "Make a 5-page deck introducing our product to a new customer…" });
```

OpenAI Agents SDK: `toOpenAIAgentTools(renderballTools(rb), { tool })`.
Plain function calling: `toFunctionDefinitions(...)` + `runTool(...)`.
Direct use: `rb.createDeck(...)`, `rb.sendFile(...)`, `rb.waitUntilReady(...)`.

Three tools: `renderball_start_deck` (brief + brand you know + outline →
the writing brief), `renderball_send_deck_file` (the file → ready / importing
/ failed), `renderball_deck_status`. The recipe behind them:
https://renderball.com/llms.txt
