# AI Workflow

How this build was made with Claude Code (Opus 4.8), what I delegated vs. owned, and the
prompts that actually moved the work.

## Tools used

| Tool | Used for |
| --- | --- |
| **Claude Code (Opus 4.8)** | Scaffolding, all code, the API route, docs drafts, build verification. |
| `npm create astro` / `astro add` / `shadcn init` | Scaffolding the exact stack (Astro 6 SSR, React 19, Tailwind v4 Vite plugin, shadcn radix-nova). |
| `curl` against the running SSR server | Smoke-testing the happy path end-to-end (`/api/lead` → mock `/ping` → `/post`) and confirming only one island hydrates. |
| **Subagents** (Claude Code Agent tool) | Building the two A/B form variants in parallel-ish, each from a tight spec against a shared hook + field parts. |

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
auto-transport copy and used invented carrier names instead of real logos.

**3a. The A/B show-off** — I asked for an experiment to demonstrate orchestration and CRO thinking:

> This is a take-home, so there's room to show off: agents work to create two variants; present the
> A/B mindset.

How it was run: Claude first extracted the shared form logic into a `useLeadForm` hook + field parts
(so the variants couldn't drift), **then spawned one subagent per variant** — each given the shared
APIs and a tight layout spec — to build the 2-step (control) and single-step (challenger) forms (the
challenger was later reworked into an email-first 2-step variant). I chose the tested variable and the
server-side, no-flicker assignment approach; the agents only wrote the two layouts. See
[`docs/AB-TESTING.md`](docs/AB-TESTING.md).

### A note on orchestration

The agents were spawned **sequentially**, not in parallel, on purpose — my global operating rules
require one tool call to fully resolve before the next. For two small, well-specified components the
cost of that is negligible. The real win wasn't parallelism; it was **isolation**: each variant was
built against the same contract without one bleeding into the other.

**3. The contract for the ping-post route** (from the brief — drove `src/pages/api/lead.ts`):

> `POST /ping` with the partial lead (route, vehicle, date) → `{ accepted, price, pingId }`. Then
> `POST /post` with the full lead + `pingId` → `{ leadId }`. The API route validates the incoming
> payload server-side before pinging. Build only the happy path.

## Where it went wrong

I created a BUGS_AND_CORRECTIONS.md file where you can find all the details about how we iterated after the first prompt if interested

The worse Claude output here was the color of the input fields, that defaulted for some reason to white and Claude spent a lot of time installing pupeteer, taking screenshots, etc, this was a point where I needed to jump into reviewing code direclty. 

The response after I suggested the fix was: 

  That's it — you nailed it. The hero is now bg-navy text-white. The shadcn Input has no explicit text color, so it inherits white from the navy hero → typed text is white-on-white (invisible). The placeholder has its own color (text-muted-foreground) so it shows. That's exactly "placeholders but no real input." My tests read .value (which was set) not the rendered color — so they wrongly passed. Real bug, your eye caught it.

## Verification

Verification was done manually, and I allowed Claude to use Pupeteer to capture stuff to validate centering, etc. 

For the sake of time, I didn't iterated using PRs in this case. 
