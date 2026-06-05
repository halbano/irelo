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
Browser (QuoteForm island)
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
- **`src/components/QuoteForm.tsx`** — the single React island (`client:load`); renders the A/B variant
  chosen server-side. Variants live in `src/components/quote/` (shared `useLeadForm` hook + `fields`,
  `SteppedQuoteForm` = A, `EmailFirstQuoteForm` = B). Everything else is static server-rendered HTML.
- **`src/lib/experiment.ts`** — sticky 50/50 variant assignment. See [`docs/AB-TESTING.md`](docs/AB-TESTING.md).

---

## Part 2 — Failure handling

Today the effort was put on the happy path, which is completely wired. 
The route returns a generic error for anything else. 

### 1. `/ping` rejected — no buyers for this lane

A rejection initially is a real business answer, not an error: nobody wants or can take this lead right away. I would **not**
retry blindly. 
Instead, degrade gracefully — keep the contact step, capture the lead anyway ("Carriers
on your route are limited — leave your details and we'll match you within 24h"), and route it to a
follow-up queue. A `/ping` *is* safe to retry on a network/5xx failure (it's read-only, no lead is
created), so I'd retry the *transport failure* a couple of times with backoff, but treat a clean
`accepted: false` as final.

### 2. `/post` returns a duplicate (409)

The lead already exists. From the user's side this is **success** — we should show a confirmation page. It doesn't make sense to ask the user to resubmit. Probably a message saying "We are already preparing your quote" that can be linked with a GET on the existing instance of the lead would be enough to redirect the user to the actual quote if this is the case. 
Showing success and deferring to the email is probably the UX I would follow.

### 3. `/post` times out / network error

This is probably the trickiest one. **`/post` can lead to duplications if we allow retries** — a retry
after a timeout can create a second lead, because the first request may have succeeded and the response was lost on the cable. So:

- I'd put a **hard timeout** on the upstream `fetch` (~8s) so the user isn't left hanging behind the
  10s `slow` case.
- I would **not** auto-retry `/post` unless we pass an **idempotency key** (e.g. the `pingId` or a
  client-generated UUID) that the backend uses to avoid duplication. Without this unique identifier we are on the risk of double-billing a duplicate lead — completely worse than asking
  the user to try again.

- User-facing: a clear, recoverable error ("We couldn't confirm your request now — please try again"), and the
  form keeps their data on the fields so one tap re-submits (this is crucial)

- Ideally, we could have a second service (as a fallback), pointing to a centralized DB to handle unexpected connection errors, downtime, etc too.

---

## Part 3 — Decisions

### 1. Design direction — why, what I cut, what's next

**Direction: high-converting minimal.** The quote form *is* the hero; the page leads with the route
pair and one orange CTA. The conversion logic: low friction, one decision at a time (2 steps, never all fields on screen). The lift comes from **type scale, spacing, and a single isolated accent** (Von
Restorff — orange reserved *only* for the primary CTA; navy carries trust everywhere else), not from
decoration. One serif accent (Fraunces) on the headline is the single premium touch; everything else
is Geist sans. No hero photo — it would cost mobile LCP for no conversion big gain initially.

**Cut for time:** address autocomplete / ZIP-to-city echo, inline price-range teaser before submit,
animated step transitions, real review-platform widgets (the Trustpilot/ratings are placeholders).

**Next:** replace placeholder trust numbers with real review-platform widgets. A **first A/B test is
already wired** — two 2-step variants (A: spec field order; B: email captured first + different hero
copy), server-side split, no flicker — see [`docs/AB-TESTING.md`](docs/AB-TESTING.md). Try `?v=a` /
`?v=b` to force a variant.

**UX improvement follow-up — assisted location → ZIP (the real win):** let a user type a city or state
(`Chicago`, `IL`, `CH`) and get assisted with the matching ZIP, instead of having to know the 5-digit
code. This is the genuinely valuable version of "ZIP help" — most people know their city, not their
ZIP. It belongs **server-side** (a real geocoding/ZIP API behind our own route, debounced, validated),
not as a client-side simulation. I built a quick simulated client-side ZIP autocomplete during the
spike and then **removed it** — a fake lookup adds island complexity and state for no real value in
this timeframe, and the honest version is a backend integration. Tracked here as the follow-up to do
properly rather than fake.

### 2. React island vs. static Astro — and the cost of hydrating the form

**Only `QuoteForm` is a React island** (`client:load`). It needs client state: 2-step navigation,
per-field validation, and the loading/error/result transitions — that's interactivity React earns.
**Everything else is static server-rendered HTML**: hero copy, trust strips, how-it-works, methodology,
FAQ (native `<details>`, no JS), footer. The mobile sticky-CTA reveal and the support-chat widget are
plain progressive enhancement (tiny `<script>`s), not hydrated components.

**Cost of hydrating the form:** shipping + parsing React + the island's JS, and a hydration pass before
the form is interactive. I keep it cheap by hydrating **only** the form and keeping the island
self-contained. I use `client:load` (not `client:idle`) because the form *is* the hero — it should be
interactive immediately, not deferred. That doesn't hurt LCP: the form is server-rendered in the
island's markup, so it's painted and the layout is stable before JS runs — hydration only wires up the
interactivity.

A representative moment of working with AI here — and where I had to step in. When the hero turned
navy, typed input text went invisible: the island's inputs had no explicit text color and inherited
the hero's white onto the white form card. The automated checks read `.value` (which *was* set) and
missed it; my eye on the rendered page caught it. Claude's explanation once I pointed at the symptom:

> That's it — you nailed it. The hero is now `bg-navy text-white`. The shadcn Input has no explicit
> text color, so it inherits white from the navy hero → typed text is white-on-white (invisible). The
> placeholder has its own color (`text-muted-foreground`) so it shows. That's exactly "placeholders but
> no real input." My tests read `.value` (which was set) not the rendered color — so they wrongly
> passed. Real bug, your eye caught it.

### 3. Paid-traffic version — LCP / CLS / INP, and what I'd measure first

- **LCP:** the headline + form card. Protect it by self-hosting fonts (already done — no Google Fonts
  round-trip), no hero image, and keeping the form server-rendered so first paint never waits on the
  island's JS (`client:load` only wires up an already-painted form).
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
