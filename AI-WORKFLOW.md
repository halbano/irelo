# AI Workflow

How this build was made with Claude Code (Opus 4.8), what I delegated vs. owned, and the
prompts that actually moved the work.

## Tools used

| Tool | Used for |
| --- | --- |
| **Claude Code (Opus 4.8)** | Scaffolding, all code, the API route, docs drafts, build verification. |
| `npm create astro` / `astro add` / `shadcn init` | Scaffolding the exact stack (Astro 6 SSR, React 19, Tailwind v4 Vite plugin, shadcn radix-nova). |
| `curl` against the running SSR server | Smoke-testing the happy path end-to-end (`/api/lead` → mock `/ping` → `/post`) and confirming only one island hydrates. |

## Delegated vs. owned

**Delegated to Claude Code:**

- Scaffolding and verifying the bleeding-edge stack versions actually installed (Astro 6.4.4,
  React 19.2, Tailwind 4.3 Vite plugin, shadcn against v4).
- Translating the locked design system (Straightaway, navy + isolated-orange, serif headline)
  into tokens and components.
- The 2-step form island, the server-side validate → ping → post route, and the README/Part 2/3
  drafts.

**Owned by me (the human):**

- Design direction and the architecture — high-converting minimal, what hydrates, what's static.
- The brand, palette, and copy direction (locked before the build).
- Live taste calls during the build (e.g. adding testimonials, the comparison subhead, the carrier
  logo strip to the hero).
- The two sections below, which are mine to write from real experience.

## Prompts that moved the work

**1. The build brief** (kicked off the whole build — design direction, stack, invariants, scope):

> Build the iRelo auto-transport quote landing page… Committed design direction: high-converting
> minimal (the QuoteWizard baseline), elevated with taste… Two non-negotiable invariants: (1) the
> form submits to our own Astro API route, the browser never calls the mock directly; (2) only the
> quote form hydrates as a React island. Brand: Straightaway. Palette locked (navy trust anchor,
> one warm-orange CTA reserved exclusively for the primary CTA)…

**2. Mid-build taste direction** (changed the hero after seeing the first version):

> Down to the hero we need to add: testimonials (card, horizontally scrollable on mobile, grid on
> desktop); a comparison-style copy over the form ("Find the lowest … from 120+ insurers and save
> up to $1,100*…"); then Trustpilot rating; above logos of brands that work with us, like the
> screenshot.

This is where I steered the design — Claude adapted the Insurify reference into on-domain
auto-transport copy and used invented carrier names instead of real logos (which would have been
deceptive).

**3. The contract for the ping-post route** (from the brief — drove `src/pages/api/lead.ts`):

> `POST /ping` with the partial lead (route, vehicle, date) → `{ accepted, price, pingId }`. Then
> `POST /post` with the full lead + `pingId` → `{ leadId }`. The API route validates the incoming
> payload server-side before pinging. Build only the happy path.

## Where it went wrong

<!-- MINE TO WRITE — from real experience. Where Claude produced something wrong or off-taste,
how I caught it, and what I did instead. Do not let Claude fill this in. -->

## Verification

<!-- MINE TO WRITE — how I convinced myself the output was correct and good, not just plausible.
Do not let Claude fill this in. -->
