# A/B test — quote-form friction

The page exists to drive one action: a completed quote. So the first experiment tests the highest-
leverage lever on that action — **how much friction the form puts between the visitor and a price.**

This documents the mindset and how it's wired. It's a real, runnable experiment, scoped to a demo:
the variant split, attribution, and event logging are live; the stats engine is a stub (no traffic).

## Hypothesis

> Showing every field on one screen (no step pagination) will **increase lead-submit rate** versus a
> 2-step wizard, because each extra screen is a drop-off point and the fields here are all low-effort.

A directional, falsifiable hypothesis — not "let's see what happens." The counter-argument is real
(a 2-step flow *feels* shorter and front-loads the cheap fields), which is exactly why it's worth a
test rather than an opinion.

## One variable

The variants differ in **exactly one thing: number of steps.** Same fields, same copy, same hero, same
validation, same CTA color. If we changed the headline *and* the form, a win wouldn't tell us which
caused it. One variable = a clean causal read.

| | Variant A (control) | Variant B (challenger) |
| --- | --- | --- |
| Layout | 2-step wizard (Shipment → Contact) | Single step, all fields on one card |
| Progress UI | Step pips, Back/Continue | None |
| Everything else | — identical — | — identical — |

## Assignment

Server-side, sticky, 50/50 — see [`src/lib/experiment.ts`](../src/lib/experiment.ts).

- **Server-side** so the correct variant is in the SSR'd HTML from the first paint. A client-side
  swap would flash the control then repaint — a layout shift (CLS) that would itself bias the result.
- **Sticky** via an `httpOnly` cookie (30d): a returning visitor always sees the same variant, so we
  measure people, not page-loads.
- **`?v=a` / `?v=b`** overrides the split for QA and the demo (and pins the cookie).

## Metrics

- **Primary:** lead-submit rate = `lead_submitted` / `experiment_exposure`, per variant. This is the
  decision metric.
- **Guardrail:** we don't ship a variant that wins on submits but tanks quality. Watch validation-
  error rate and (downstream) the contact-reachability of submitted leads — a single-step form could
  lift submits while lowering data quality.
- **Instrumentation:** both events are emitted with `experiment` + `variant`
  ([`src/lib/track.ts`](../src/lib/track.ts)) — exposure on page render, conversion in the lead route
  after a confirmed `/post`. In production these feed a warehouse / product-analytics tool.

## Calling it (the discipline)

- **Pick the sample size up front.** For a ~12% baseline submit rate, detecting a ~2pt absolute lift
  (80% power, 95% confidence) needs on the order of a few thousand exposures per arm. Decide this
  *before* starting.
- **No peeking.** Don't stop the moment it looks significant — repeatedly checking inflates false
  positives. Run to the pre-set sample size (or use a sequential-testing method built for early stops).
- **Practical significance, not just statistical.** A 0.3pt lift that's "significant" at huge N may not
  be worth the maintenance of two form code-paths.
- **Loser gets deleted.** The variants are intentionally separate components so they can diverge during
  the test; once it's called, delete the loser and fold the winner back into one path. Don't leave dead
  variants accruing.

## Why this is safe to run on a conversion page

No flicker (server-rendered), no added client JS for assignment, no third-party experiment SDK loading
on the critical path — all the things that usually make A/B testing *cost* you LCP/CLS are avoided by
doing the split on the server.
