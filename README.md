# Straightaway — auto-transport quote landing page

A mobile-first auto-transport quote landing page. One job: get the visitor to complete a
2-step quote form, submit the lead through our own server, and show them a price.

**Stack:** Astro 6 (SSR, `@astrojs/node` standalone) · React 19 (one island) · TypeScript ·
Tailwind CSS v4 (Vite plugin, no config file) · shadcn/ui form primitives.

---

## Run it from a clean clone

```sh
npm install
cp .env.example .env            # MOCK_BASE_URL=http://localhost:9000

# Terminal 1 — the mock ping-post backend (dependency-free, listens on :9000)
node mock-ping-post.mjs

# Terminal 2 — the app
npm run dev                     # http://localhost:4321
```

Production / SSR check:

```sh
npm run build
MOCK_BASE_URL=http://localhost:9000 node ./dist/server/entry.mjs   # http://localhost:4321
```

Fill the form with any valid ZIPs, a non-`boat` vehicle, and an email **without** `dupe`/`slow`
to see the happy path: a quoted price and a confirmation.

---

## How it's wired

```text
Browser (QuoteWizard island)
   │  POST /api/lead   (full lead)
   ▼
src/pages/api/lead.ts   ── validates server-side ──┐
   │  POST /ping  (route + vehicle + date)          │  the browser NEVER
   │  POST /post  (full lead + pingId)              │  calls the mock directly
   ▼                                                │
mock-ping-post.mjs  (:9000)  ←──────────────────────┘
```

- **`src/lib/lead.ts`** — shared lead shape + `validateLead()`. Used for client-side field hints;
  enforced authoritatively on the server.
- **`src/pages/api/lead.ts`** — the only thing that talks to the mock. Validate → `/ping` → `/post`.
- **`src/components/QuoteForm.tsx`** — the single React island (`client:idle`); renders the A/B variant
  chosen server-side. Variants live in `src/components/quote/` (shared `useLeadForm` hook + `fields`,
  `SteppedQuoteForm` = A, `SingleQuoteForm` = B). Everything else is static server-rendered HTML.
- **`src/lib/experiment.ts`** — sticky 50/50 variant assignment. See [`docs/AB-TESTING.md`](docs/AB-TESTING.md).

---

## Part 2 — Failure handling (production write-up · draft for review)

Today only the happy path is built. The route returns a generic error for anything else. Here's how
I'd handle the three real failure modes in production — **the retry calls are yours to make; I've
framed the tradeoff.**

### 1. `/ping` rejected — no buyers for this lane

A rejection is a real business answer, not an error: nobody wants this lead right now. I would **not**
retry blind. Instead, degrade gracefully — keep the contact step, capture the lead anyway ("Carriers
on your route are limited — leave your details and we'll match you within 24h"), and route it to a
follow-up queue. A `/ping` *is* safe to retry on a network/5xx failure (it's read-only, no lead is
created), so I'd retry the *transport failure* a couple of times with backoff, but treat a clean
`accepted: false` as final.

### 2. `/post` returns a duplicate (409)

The lead already exists. From the user's side this is **success** — show the confirmation, don't make
them resubmit. I'd surface the existing `leadId` (if the backend returns it) and move on. The risk is
treating 409 as an error and prompting a resubmit, which produces a worse experience for an outcome
that's actually fine.

### 3. `/post` times out / network error

This is the dangerous one. **`/post` is not safely idempotent unless the backend dedupes** — a retry
after a timeout can create a second lead, because the first request may have succeeded and we just
never saw the response. So:

- I'd put a **hard timeout** on the upstream `fetch` (~8s) so the user isn't left hanging behind the
  10s `slow` case.
- I would **not** auto-retry `/post` unless we pass an **idempotency key** (e.g. the `pingId` or a
  client-generated UUID) that the backend uses to dedupe. With that key, retry is safe. Without it,
  retrying trades a clean failure for the risk of double-billing a duplicate lead — worse than asking
  the user to try again.
- User-facing: a clear, recoverable error ("We couldn't confirm your request — try again"), and the
  form keeps their data so one tap re-submits.

**The call I'd want from you:** does the backend dedupe `/post` on an idempotency key? If yes, I auto-
retry once. If no, I fail clean and let the user re-submit, because a duplicate lead costs real money.

---

## Part 3 — Decisions (draft for review)

### 1. Design direction — why, what I cut, what's next

**Direction: high-converting minimal.** The quote form *is* the hero; the page leads with the route
pair and one orange CTA. The conversion logic: low friction, one decision at a time (2 steps, never 8
fields on screen). The lift comes from **type scale, spacing, and a single isolated accent** (Von
Restorff — orange reserved *only* for the primary CTA; navy carries trust everywhere else), not from
decoration. One serif accent (Fraunces) on the headline is the single premium touch; everything else
is Geist sans. No hero photo — it would cost mobile LCP for no conversion gain.

**Cut for time:** address autocomplete / ZIP-to-city echo, inline price-range teaser before submit,
animated step transitions, real review-platform widgets (the Trustpilot/ratings are placeholders).

**Next:** server-validated ZIP→city lookup so step 1 confirms the route back to the user; replace
placeholder trust numbers with real review-platform widgets. A **first A/B test is already wired** —
2-step vs. single-step form, server-side split, no flicker — see
[`docs/AB-TESTING.md`](docs/AB-TESTING.md). Try `?v=a` / `?v=b` to force a variant.

### 2. React island vs. static Astro — and the cost of hydrating the form

**Only `QuoteWizard` is a React island** (`client:idle`). It needs client state: 2-step navigation,
per-field validation, and the loading/error/result transitions — that's interactivity React earns.
**Everything else is static server-rendered HTML**: hero copy, trust strips, how-it-works, methodology,
FAQ (native `<details>`, no JS), footer. The mobile sticky-CTA reveal is plain progressive enhancement
(a tiny IntersectionObserver `<script>`), not a hydrated component.

**Cost of hydrating the form:** shipping + parsing React + the island's JS, and a hydration pass before
the form is interactive. I keep it cheap by hydrating **only** the form, deferring with `client:idle`
(the static hero paints first; hydration happens at idle), and keeping the island self-contained.
The form is server-rendered in the island's markup, so it's visible and the layout is stable before JS
runs — hydration only wires up the interactivity.

### 3. Paid-traffic version — LCP / CLS / INP, and what I'd measure first

- **LCP:** the headline + form card. Protect it by self-hosting fonts (already done — no Google Fonts
  round-trip), no hero image, and not letting the island block first paint (`client:idle`).
- **CLS:** the biggest risk is the sticky bar and the form reserving space. The form is SSR'd at its
  final size; the sticky bar is `position: fixed` and transform-revealed, so it doesn't reflow content.
  Fonts are self-hosted to avoid a swap shift.
- **INP:** the form interactions — keep the island light, avoid heavy validation work on every keystroke.

**First thing I'd measure:** field-level **LCP from real users** (the form card) on a throttled mobile
connection, because on paid traffic a slow first paint above the fold is paid clicks bouncing before
they ever see the CTA.

---

## Notes & constraints

- The mock's `/ping` price is `$35–74` (a per-lead price in the mock's model); the UI presents the
  returned number as the customer's estimate, per the brief's contract.
- Deterministic mock triggers exist (`boat` → rejected, email `dupe` → duplicate, email `slow` → 10s
  delay) but **handling for them is intentionally not built** — see the Part 2 write-up.
- No `tailwind.config.js` — Tailwind v4 is configured via the Vite plugin and `src/styles/global.css`.
