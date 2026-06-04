# Bugs & Corrections Log

Iterations after the initial build (landing page + 2-step form + lead API + A/B test).
Chronological. **Bug** = functional defect. **Correction** = design/direction change from the
owner. **Non-issue** = reported but not a code defect.

| # | Type | What | Resolution |
| --- | --- | --- | --- |
| 1 | Correction | Hero felt thin | Added testimonials (scroll on mobile, grid on desktop), a comparison-style subhead (120+ carriers / save up to $450*), and a carrier logo strip. |
| 2 | Correction | "Show off" — wanted A/B + agents | Built a quote-form-friction A/B test (2-step vs single-step). Two subagents each built one variant against a shared `useLeadForm` hook + field parts. Added `docs/AB-TESTING.md`. |
| 3 | Correction | Wanted more life on the page | Subtle navy/white hero depth (no image), section color rhythm, reduced-motion-safe CSS motion. Pushed back on hero photo + GSAP (LCP/CLS + reverses locked direction). |
| 4 | Correction | Chat widget requested (brief said "not building") | Added a **static** chat widget (native `<details>`, zero hydration) — kept the "only the form hydrates" invariant. Pushed back on a faux-chat React island. |
| 5 | Correction | "More vivid hero bg" | Full deep-navy hero band; text flipped to white; white form card pops, orange CTA isolates harder. Kept orange out of the bg glow to protect CTA isolation. |
| 6 | Correction | Replace carrier strip with a "Trusted by the best" logo row + add "What makes us different" | Navy partner strip (invented names — real logos would be deceptive) + 3-feature confidence section adapted from the uShip copy. |
| 7 | Non-issue | "Can we randomly show variant B too?" | Already 50/50 random (proved 7A/5B on fresh visits). The sticky cookie pins a returning visitor by design. Documented; no code change. |
| 8 | **Bug** | **Vehicle-type select didn't work** | Radix `Select`'s portal was unreliable inside the deferred-hydration island. Replaced with a native `<select>` styled to match — bulletproof + accessible. |
| 9 | Correction | Simulate ZIP autocomplete after 3 digits | Prefix-matched city/state suggestions from a small static sample (`src/lib/zips.ts`). |
| 10 | Correction | Clearer header call button + Sign in | Call became a bordered pill (icon + number); added a navy "Sign in" placeholder (secondary action). |
| 11 | Correction | Remove ship date from Variant A | Field removed from A; `shipDate` made optional in validation. **Caveat:** A and B now differ in two things (steps + date) — flagged in `docs/AB-TESTING.md` as a test-cleanliness debt. |
| 12 | Correction | "Start a chat" should open a chat, not email | Replaced mailto with a simulated conversation (canned, keyword-aware replies) via a tiny vanilla script — still not a React island. |
| 13 | Correction | "Why do we need your ZIP?" shifted the layout | Converted the expander to an absolutely-positioned tooltip (hover/focus/tap) — no reflow. |
| 14 | Correction | Wanted stronger color on "What makes us different" | Soft emerald → strong saturated tiles (teal-500 / blue-600 / violet-600, white icons) on white cards. Orange still reserved for the CTA. |
| 15 | Non-issue | "ZIP fields don't accept input" | Reproduced in a real headless browser (system Chrome): typing works, value updates, suggestions show, **zero console errors**. Root cause was a stale dev-server/HMR state — fix is a hard refresh / `npm run dev` restart. No code change. |
| 16 | Correction | Disliked the chat opening straight to the transcript | Reverted to a two-button intro (Start a chat / Call); "Start a chat" reveals the sim. |
| 17 | Correction | "Shipment" step label was weak | Step 1 label → "Route & vehicle" (matches its fields after the date was removed). |
| 18 | **Bug** | **Mobile chat couldn't be minimized** | The bubble (its only toggle) hid when open. Added an explicit close (×) button that collapses the `<details>`. |
| 19 | **Bug** | **Typed input text was invisible** ("only visible when selected") | Inputs inherited the navy hero's `text-white` onto the white form card → white-on-white. Placeholders had their own color so they still showed — which is why earlier `.value`-based checks wrongly passed. Forced `text-foreground` on the Input primitive + form cards. Caught by the owner's eye ("is the input color not black?"), then confirmed via computed-style check (`rgb(10,10,10)`). |
| 20 | **Bug** | **"Failed to fetch" on submit** | The route's upstream `/ping`+`/post` calls weren't wrapped, so an unreachable mock threw unhandled and the client saw a raw fetch failure. Wrapped them → clean 502 JSON the form renders as a real message. (Also: run the mock on :9000.) |
| 21 | Correction | Easier way back to step 1 | Step-2 stepper is now a back control, and the text "Back" became an arrow-icon button beside the CTA. Also switched the island to `client:load` (it's the hero) for immediate interactivity. |
| 22 | Correction | Ship date: removed from both variants, then **restored** | Owner removed it from A, then B (clean one-variable A/B), then asked to add it back to both (the deletion was a mistake). Re-added as a required step-1 field; both variants identical again. |
| 23 | Correction | Remove the simulated ZIP autocomplete | Dropped the client-side suggestions (and `src/lib/zips.ts`) to cut complexity in the timeframe — a fake lookup added island state for no real value. ZipField is a plain input again. The genuinely valuable version (type city/state → assisted ZIP, server-side) is captured as a README follow-up. |

## Notes on how bugs were caught

- The vehicle-select and ZIP "bugs" were both **interaction-level**, invisible to `curl`/SSR checks.
  They were diagnosed by driving the built app in a real headless browser (system Chrome via
  `puppeteer-core`) — typing into fields, clicking, reading `value` and the console. The browser
  proved the ZIP report was a non-issue (stale dev state), and confirmed the native-select fix.
  That tooling was used for verification only and removed afterward to keep the repo lean.
