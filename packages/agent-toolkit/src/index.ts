/**
 * @renderball/agent-toolkit — give any AI agent the ability to build a
 * designed, animated, editable presentation on Renderball.
 *
 * Three tools, framework-neutral: start a deck (with the brand the agent
 * knows and its outline; the reply carries the WRITING BRIEF), send the
 * deck file the agent wrote, check the import. Adapters turn them into the
 * shapes the Vercel AI SDK, the OpenAI Agents SDK and LangChain expect
 * without importing any of those packages here.
 *
 * No account is needed: without an API key the deck is a guest deck and the
 * reply carries a guest_token (the agent must pass it back) and deck_url, the
 * one link to give the user. With `apiKey` (rb_live_… from renderball.com/account)
 * decks land in that account with no limits.
 */

export interface RenderballOptions {
  /** Defaults to https://renderball.com */
  baseUrl?: string;
  /** rb_live_… from renderball.com/account. Omit for guest mode. */
  apiKey?: string;
  /** Override for tests. */
  fetch?: typeof fetch;
}

export interface DeclaredBrand {
  name: string;
  website?: string;
  accent?: string;
  background?: string;
  text?: string;
  fonts?: { headline?: string; body?: string };
  logo_url?: string;
  voice?: string;
}

export interface OutlinePage {
  label: string;
  description: string;
  visual_concept: string;
  content: {
    eyebrow?: string;
    headline: string;
    lede?: string;
    bullets?: string[];
    caption?: string;
    cta?: { primary: string; secondary?: string };
    meta?: string;
  };
}

export interface CreateDeckInput {
  brief: string;
  pages?: number;
  tone?: string;
  brand?: DeclaredBrand;
  outline?: OutlinePage[];
}

export interface CreateDeckResult {
  deck_id: string;
  guest_token?: string;
  deck_url?: string;
  editor_url?: string;
  writing_brief?: string;
  brand?: string;
  next?: string;
  [k: string]: unknown;
}

export interface DeckStatus {
  status: "ready" | "importing" | "failed" | "idle" | string;
  deck_id?: string;
  deck_url?: string;
  editor_url?: string;
  error?: string;
  truth_flags?: number;
  [k: string]: unknown;
}

export class RenderballError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "RenderballError";
  }
}

export interface Renderball {
  createDeck(input: CreateDeckInput): Promise<CreateDeckResult>;
  sendFile(deckId: string, source: string, opts?: { guestToken?: string; label?: string; waitSeconds?: number }): Promise<DeckStatus>;
  status(deckId: string, opts?: { guestToken?: string }): Promise<DeckStatus>;
  brief(deckId: string, opts?: { guestToken?: string }): Promise<{ writing_brief: string }>;
  /** Poll until the import settles (ready or failed). */
  waitUntilReady(deckId: string, opts?: { guestToken?: string; timeoutMs?: number; intervalMs?: number }): Promise<DeckStatus>;
}

export const createRenderball = (opts: RenderballOptions = {}): Renderball => {
  const base = (opts.baseUrl ?? "https://renderball.com").replace(/\/$/, "");
  const f = opts.fetch ?? fetch;
  const auth = (): Record<string, string> => (opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {});
  const q = (guestToken?: string) => (guestToken ? `guest_token=${encodeURIComponent(guestToken)}` : "");
  const call = async <T>(path: string, init: RequestInit): Promise<T> => {
    const res = await f(`${base}${path}`, init);
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* not JSON */
    }
    if (!res.ok) {
      const msg = typeof body === "object" && body && "error" in body ? String((body as { error: unknown }).error) : `HTTP ${res.status}`;
      throw new RenderballError(msg, res.status, body);
    }
    return body as T;
  };
  const api: Renderball = {
    createDeck: (input) =>
      call<CreateDeckResult>("/api/agent/decks", { method: "POST", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify(input) }),
    sendFile: (deckId, source, o = {}) => {
      const params = [q(o.guestToken), o.waitSeconds !== undefined ? `wait=${o.waitSeconds}` : "wait=45"].filter(Boolean).join("&");
      return call<DeckStatus>(`/api/agent/decks/${encodeURIComponent(deckId)}/file?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth() },
        body: JSON.stringify({ source, label: o.label ?? "agent-toolkit" }),
      });
    },
    status: (deckId, o = {}) => call<DeckStatus>(`/api/agent/decks/${encodeURIComponent(deckId)}/status?${q(o.guestToken)}`, { headers: auth() }),
    brief: (deckId, o = {}) => call<{ writing_brief: string }>(`/api/agent/decks/${encodeURIComponent(deckId)}/brief?${q(o.guestToken)}`, { headers: auth() }),
    waitUntilReady: async (deckId, o = {}) => {
      const deadline = Date.now() + (o.timeoutMs ?? 5 * 60_000);
      let last = await api.status(deckId, o);
      while (last.status === "importing" && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, o.intervalMs ?? 10_000));
        last = await api.status(deckId, o);
      }
      return last;
    },
  };
  return api;
};

/** A framework-neutral tool: name, description, JSON-schema parameters, execute. */
export interface AgentTool<I = Record<string, unknown>, O = unknown> {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (input: I) => Promise<O>;
}

const brandSchema = {
  type: "object",
  description: "The brand as you KNOW it. Only the name is required; never guess a colour — leave it out.",
  properties: {
    name: { type: "string", description: "The brand's name." },
    website: { type: "string", description: "Their website, optional." },
    accent: { type: "string", description: "Lead colour as 6-digit hex, only if known." },
    background: { type: "string", description: "Page background as hex, only if known." },
    text: { type: "string", description: "Text colour as hex, only if known." },
    fonts: { type: "object", properties: { headline: { type: "string" }, body: { type: "string" } } },
    logo_url: { type: "string", description: "A public https image of the logo, only if you have one." },
    voice: { type: "string", description: "How the brand speaks, optional." },
  },
  required: ["name"],
};

const outlineSchema = {
  type: "array",
  description: "One entry per page, 1 to 16. Every page needs a headline.",
  items: {
    type: "object",
    properties: {
      label: { type: "string" },
      description: { type: "string" },
      visual_concept: { type: "string" },
      content: {
        type: "object",
        properties: {
          eyebrow: { type: "string" },
          headline: { type: "string" },
          lede: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          caption: { type: "string" },
          cta: { type: "object", properties: { primary: { type: "string" }, secondary: { type: "string" } }, required: ["primary"] },
          meta: { type: "string" },
        },
        required: ["headline"],
      },
    },
    required: ["label", "description", "visual_concept", "content"],
  },
};

/**
 * The three tools an agent needs. Descriptions carry the rules: real facts
 * only, declare what you know, keep the guest_token, hand the user deck_url.
 */
export const renderballTools = (rb: Renderball): AgentTool[] => [
  {
    name: "renderball_start_deck",
    description:
      "Start a presentation on Renderball. Give the user's brief, the brand as you know it (never guess a colour), the page count and your page-by-page outline. Returns deck_id, guest_token (keep it and pass it to the other tools), deck_url (the one link for the user) and writing_brief — the exact instructions for writing the deck file. Real facts only: numbers not in the user's material are flagged, never invented.",
    parameters: {
      type: "object",
      properties: {
        brief: { type: "string", description: "What the deck is for, who it is for, what it should argue and ask (20–6000 characters)." },
        pages: { type: "integer", minimum: 1, maximum: 16, description: "How many pages you will write (default 5)." },
        tone: { type: "string", description: "The register, optional." },
        brand: brandSchema,
        outline: outlineSchema,
      },
      required: ["brief", "outline"],
    },
    execute: (input) => rb.createDeck(input as unknown as CreateDeckInput),
  },
  {
    name: "renderball_send_deck_file",
    description:
      "Send the COMPLETE deck file you wrote exactly as writing_brief specified. Returns ready (with deck_url), importing (then call renderball_deck_status), or failed with the reason — fix the file and send it again.",
    parameters: {
      type: "object",
      properties: {
        deck_id: { type: "string" },
        guest_token: { type: "string", description: "From renderball_start_deck, when no API key is configured." },
        source: { type: "string", description: "The whole deck file." },
      },
      required: ["deck_id", "source"],
    },
    execute: (input) => rb.sendFile(String(input.deck_id), String(input.source), { guestToken: input.guest_token as string | undefined }),
  },
  {
    name: "renderball_deck_status",
    description: "Whether a submitted deck is still importing, ready (with deck_url — give it to the user), or failed (with the reason).",
    parameters: {
      type: "object",
      properties: { deck_id: { type: "string" }, guest_token: { type: "string" } },
      required: ["deck_id"],
    },
    execute: (input) => rb.status(String(input.deck_id), { guestToken: input.guest_token as string | undefined }),
  },
];

/**
 * Adapters. Each takes the framework's own helpers as arguments so this
 * package imports none of them.
 *
 *   import { tool, jsonSchema } from "ai";
 *   const tools = toVercelAiTools(renderballTools(rb), { tool, jsonSchema });
 *   generateText({ model, tools, ... });
 */
export const toVercelAiTools = (
  tools: AgentTool[],
  ai: { tool: (def: { description: string; inputSchema: unknown; execute: (input: any) => Promise<unknown> }) => unknown; jsonSchema: (schema: Record<string, unknown>) => unknown },
): Record<string, unknown> =>
  Object.fromEntries(tools.map((t) => [t.name, ai.tool({ description: t.description, inputSchema: ai.jsonSchema(t.parameters), execute: (input) => t.execute(input) })]));

/**
 *   import { tool } from "@openai/agents";
 *   const tools = toOpenAIAgentTools(renderballTools(rb), { tool });
 *   new Agent({ tools, ... })
 */
export const toOpenAIAgentTools = (
  tools: AgentTool[],
  agents: { tool: (def: { name: string; description: string; parameters: unknown; strict?: boolean; execute: (input: any) => Promise<unknown> }) => unknown },
): unknown[] =>
  tools.map((t) => agents.tool({ name: t.name, description: t.description, parameters: t.parameters, strict: false, execute: (input) => t.execute(input).then((r) => JSON.stringify(r)) }));

/** Plain OpenAI / Anthropic function-calling definitions (no framework). */
export const toFunctionDefinitions = (tools: AgentTool[]): { name: string; description: string; parameters: Record<string, unknown> }[] =>
  tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }));

/** Run a tool by name with already-parsed arguments (the other half of toFunctionDefinitions). */
export const runTool = async (tools: AgentTool[], name: string, args: Record<string, unknown>): Promise<unknown> => {
  const t = tools.find((x) => x.name === name);
  if (!t) throw new Error(`unknown tool ${name}`);
  return t.execute(args);
};
