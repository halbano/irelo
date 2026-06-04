# Q&A Log

Clarifying questions asked during the build, with answers. Kept as a running record.

### Q: What determines that the phone field is optional?

The **server-side validator** ([`src/lib/lead.ts`](../src/lib/lead.ts), `validateLead`). It only
flags phone when 1–9 digits are entered (a partial number); an **empty** phone passes. The mock's
`/post` never required phone either. So empty → no error → the lead submits. The `(optional)` label
and hint just disclose what validation already allows. (Verified: a submit with `phone: ""` returns
`{ ok: true, price, leadId }`.)

### Q: How does Variant B send data — does it concatenate the `/ping` and `/post` calls?

No concatenation, and **B sends exactly like A.** Both variants POST the *complete* lead as **one**
request to our own route, `/api/lead`, with the variant tagged as metadata (`variant: "b"`). The form
never calls the mock and never touches `/ping` or `/post` itself.

The **server route** then orchestrates the two upstream calls **sequentially** (not concatenated):

1. `POST {MOCK}/ping` with the partial lead (route + vehicle) → `{ accepted, price, pingId }`
2. `POST {MOCK}/post` with the full lead **+ that `pingId`** → `{ leadId }`

Step 2 depends on step 1's `pingId`, so they're ordered, not merged. The browser only ever makes the
single `/api/lead` request (invariant: the browser never calls the mock directly). Variant A and B are
identical here — only the *form layout* differs, never the submission path.

### Q: How do I load Variant B manually?

Append `?v=b` to the URL (`?v=a` for A). Assignment is otherwise a sticky 50/50 cookie split, so a
returning browser keeps its variant — clear the `sa_exp_form` cookie (or use incognito) to re-roll.

### Q: Was the mock ping-post API documented, or missing from the brief?

It was in the brief (Part 2) and is documented in the repo: README run steps + "How it's wired"
diagram + Part 2 failure-handling write-up, [`.env.example`](../.env.example) (`MOCK_BASE_URL`), and
the committed [`mock-ping-post.mjs`](../mock-ping-post.mjs) itself.
