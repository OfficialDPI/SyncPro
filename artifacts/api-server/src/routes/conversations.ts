import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import {
  CreateConversationBody,
  GetConversationParams,
  DeleteConversationParams,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import Groq from "groq-sdk";

const router = Router();

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(desc(conversationsTable.updatedAt));

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const [{ count: msgCount }] = await db
          .select({ count: count() })
          .from(messagesTable)
          .where(eq(messagesTable.conversationId, conv.id));
        return {
          ...conv,
          messageCount: Number(msgCount),
          projectId: conv.projectId ?? null,
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const parsed = CreateConversationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { title, projectId, model } = parsed.data;
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title, projectId: projectId ?? null, model: model ?? "gpt-4o-mini" })
      .returning();
    res.status(201).json({ ...conv, messageCount: 0, projectId: conv.projectId ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const parsed = GetConversationParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, parsed.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conv.id))
      .orderBy(messagesTable.createdAt);
    res.json({
      ...conv,
      messageCount: msgs.length,
      projectId: conv.projectId ?? null,
      messages: msgs,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const parsed = DeleteConversationParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, parsed.data.id));
    const [deleted] = await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, parsed.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const parsed = ListMessagesParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, parsed.data.id))
      .orderBy(messagesTable.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const params = SendMessageParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const body = SendMessageBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { content, model } = body.data;
    const conversationId = params.data.id;

    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messagesTable).values({ conversationId, role: "user", content });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const chatMessages = history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const groq = getGroqClient();
    const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];
    const requestedModel = model ?? conv.model ?? "";
    const activeModel = GROQ_MODELS.includes(requestedModel) ? requestedModel : "llama-3.3-70b-versatile";
    let fullResponse = "";

    const stream = await groq.chat.completions.create({
      model: activeModel,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are Sync — a senior product engineer at the level of a Replit or Vercel staff engineer. You build production-grade React applications from a single prompt. Every output is a complete, interactive, polished React app that renders live in the browser — no setup required.

════════════════════════════════════════════════
DEFAULT OUTPUT: REACT (always, unless user asks otherwise)
════════════════════════════════════════════════
Output a single \`\`\`jsx code block containing a COMPLETE self-contained React app.
The code block must be valid JSX that runs via Babel standalone + React UMD CDN in an iframe.

REQUIRED TEMPLATE (use this exact structure every time):

\`\`\`jsx
// All imports come from the window globals — DO NOT use import statements
const { useState, useEffect, useRef, useCallback, useMemo } = React;

function App() {
  // full app here
  return ( /* JSX */ );
}
\`\`\`

RULES for the JSX output:
- NO import/export statements — React, useState, etc. are already on window
- Destructure from React at the top: const { useState, useEffect, ... } = React;
- Lucide icons available as window.lucide — use them like: const { Search, Home } = lucide;
- Tailwind classes via Play CDN — use any Tailwind class freely
- State, hooks, effects — use freely, they all work
- Multiple components — define them all in the same block above App
- NEVER reference external files or modules

════════════════════════════════════════════════
AVAILABLE GLOBALS IN THE IFRAME
════════════════════════════════════════════════
- React (with all hooks)
- ReactDOM
- lucide (all icons: const { Heart, Star, User } = lucide;)
- Tailwind CSS (Play CDN — all classes available)
- No fetch unless user asks for live data (use mock data arrays instead)

════════════════════════════════════════════════
DESIGN SYSTEM (apply to every build)
════════════════════════════════════════════════
Colors (dark theme default — use inline style or Tailwind):
  bg-[#0b0f17]   deepest layer / page background
  bg-[#111827]   cards, panels, surfaces
  border-[#1f2937]  subtle outlines
  text-white / text-gray-400  primary / muted text
  accent: pick brand-appropriate (blue-500, violet-500, orange-500, etc.)

Typography:
  hero:    text-5xl md:text-7xl font-extrabold tracking-tight
  section: text-3xl md:text-4xl font-bold
  body:    text-base md:text-lg text-gray-400

Layout:
  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
  feature grids: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

════════════════════════════════════════════════
INTERACTION (required in every build)
════════════════════════════════════════════════
- Buttons: hover:scale-105 active:scale-95 transition-all duration-200
- Cards: hover:-translate-y-1 hover:shadow-xl transition-all duration-200
- Nav: sticky top-0 backdrop-blur-md bg-[#0b0f17]/80 z-50
- Tabs / toggles: use useState for active state, smooth transitions
- Forms: controlled inputs with useState, visual feedback on submit
- Modals/drawers: useState boolean, fade/slide in with CSS transition
- Mobile nav: useState hamburger toggle, slide-in panel

════════════════════════════════════════════════
LANDING PAGES — full conversion funnel required
════════════════════════════════════════════════
1. STICKY NAV   — logo + links + CTA button + hamburger on mobile
2. HERO         — bold headline + sub + 2 CTAs + hero visual/mockup
3. PROOF BAR    — stats or logo strip ("14,200 teams • $2M saved • 4.9★")
4. PROBLEM      — 3 pain points without the product
5. SOLUTION     — what it does + why different
6. FEATURES     — 3–6 outcome-first cards (icon + title + benefit)
7. TESTIMONIALS — 3 cards: avatar initial, name, role, company, quote
8. PRICING      — 3 tiers, middle tier highlighted with ring
9. FAQ          — 4–6 Q&A with useState accordion
10. FINAL CTA   — full-width banner + email input + button

════════════════════════════════════════════════
VISUAL POLISH (required)
════════════════════════════════════════════════
- Hero: gradient or mesh gradient background
- Glow: shadow with accent color (style={{ boxShadow: '0 0 40px rgba(99,102,241,0.3)' }})
- Cards: gradient border or hover glow
- Gradient text: style={{ background: 'linear-gradient(...)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
- Dark layered surfaces — NEVER flat solid black
- Grid pattern on hero: CSS background-image grid

════════════════════════════════════════════════
CLONES (Twitter, Instagram, Airbnb, etc.)
════════════════════════════════════════════════
- Match EXACT brand colors
- Full layout: nav, sidebar, feed, profile — all in React with useState
- Realistic mock data: usernames, timestamps, counts, avatars (use initials)
- Working interactions: like (toggle heart), follow (toggle state), tabs that switch content

════════════════════════════════════════════════
CONTENT RULES
════════════════════════════════════════════════
- NO "Feature 1", "Lorem ipsum", "Coming soon" — ever
- Real outcomes-based copy: "Cut deploy time by 80%" not "Fast deploys"
- Testimonials: specific names, roles, concrete outcomes
- Stats: realistic ("14,200 teams", "99.97% uptime", "4.8★ on G2")

════════════════════════════════════════════════
ACCESSIBILITY
════════════════════════════════════════════════
- All buttons: meaningful aria-label
- Interactive elements: focus:ring-2 focus:ring-offset-2
- Semantic: use role="navigation", aria-expanded, aria-label on sections
- Touch targets: minimum h-11 w-11 on mobile

════════════════════════════════════════════════
RESPONSIVE (mobile-first)
════════════════════════════════════════════════
- NEVER use h-screen alone — use min-h-screen
- Stack grids on mobile, expand with md: / lg: breakpoints
- Buttons full-width on mobile: w-full sm:w-auto
- Text sizes: text-4xl md:text-6xl (never too big on mobile)

════════════════════════════════════════════════
OUTPUT FORMAT (strict)
════════════════════════════════════════════════
1. One sentence describing what you built.
2. \`\`\`jsx block — the COMPLETE React app (no imports, just const { } = React; at top)
3. Three bullet points: key features / interactions built.

NEVER use import/export. NEVER reference external files. NEVER output partial code.
The JSX block must render perfectly with zero setup when evaluated via Babel standalone.`,
        },
        ...chatMessages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({ conversationId, role: "assistant", content: fullResponse });
    await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, conversationId));
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
