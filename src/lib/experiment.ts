import type { AstroCookies } from "astro";

// A/B experiment: quote-form friction. Variant A = 2-step wizard, B = single step.
// Assignment is server-side and sticky (cookie) so a returning visitor always
// sees the same variant and there's no client-side flicker / layout shift.

export const FORM_EXPERIMENT = "quote_form_friction";
export const VARIANTS = ["a", "b"] as const;
export type Variant = (typeof VARIANTS)[number];

const COOKIE = "sa_exp_form";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

const isVariant = (v: unknown): v is Variant => v === "a" || v === "b";

/**
 * Resolve the visitor's variant. Order of precedence:
 *   1. `?v=a|b` query override (for QA / demo) — also pins the cookie.
 *   2. existing cookie (sticky assignment).
 *   3. fresh 50/50 split, persisted to the cookie.
 */
export function assignVariant(cookies: AstroCookies, url: URL): Variant {
  const override = url.searchParams.get("v");
  if (isVariant(override)) return persist(cookies, override);

  const existing = cookies.get(COOKIE)?.value;
  if (isVariant(existing)) return existing;

  return persist(cookies, Math.random() < 0.5 ? "a" : "b");
}

function persist(cookies: AstroCookies, variant: Variant): Variant {
  cookies.set(COOKIE, variant, {
    path: "/",
    maxAge: THIRTY_DAYS,
    sameSite: "lax",
    httpOnly: true,
  });
  return variant;
}
