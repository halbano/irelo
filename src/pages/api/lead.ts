import type { APIRoute } from "astro";
import { validateLead, type LeadInput } from "@/lib/lead";
import { track } from "@/lib/track";
import { FORM_EXPERIMENT } from "@/lib/experiment";

export const prerender = false;

const MOCK_BASE_URL = process.env.MOCK_BASE_URL ?? "http://localhost:9000";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

/**
 * Lead intake. The browser only ever talks to this route — never the mock.
 * Flow: validate -> POST /ping (partial) -> POST /post (full + pingId).
 * Happy path only; non-happy upstream results surface as a generic error
 * (production failure handling is discussed in the README).
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Partial<LeadInput> & { experiment?: string; variant?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid request body." }, 400);
  }

  // Server-side validation is authoritative; the client mirror is just UX.
  const errors = validateLead(body);
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 400);
  }
  const lead = body as LeadInput;

  // 1) PING with the partial lead — does anyone want it, and at what price?
  let ping: { accepted?: boolean; price?: number; pingId?: string };
  let post: { confirmed?: boolean; leadId?: string };
  try {
    const pingRes = await fetch(`${MOCK_BASE_URL}/ping`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        originZip: lead.originZip,
        destinationZip: lead.destinationZip,
        vehicleType: lead.vehicleType,
        shipDate: lead.shipDate,
      }),
    });
    ping = await pingRes.json();

    if (!pingRes.ok || !ping?.accepted) {
      return json(
        { ok: false, message: "We couldn't match your route right now. Please try again." },
        502,
      );
    }

    // 2) POST the full lead with the pingId to confirm the match.
    const postRes = await fetch(`${MOCK_BASE_URL}/post`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, pingId: ping.pingId }),
    });
    post = await postRes.json();

    if (!postRes.ok || !post?.confirmed) {
      return json(
        { ok: false, message: "We couldn't confirm your request. Please try again." },
        502,
      );
    }
  } catch (err) {
    // Upstream unreachable (e.g. the mock server isn't running on :9000).
    // Return clean JSON so the client shows a real error, not "Failed to fetch".
    console.error("[api/lead] upstream error:", err);
    return json(
      { ok: false, message: "We couldn't reach our carrier network right now. Please try again." },
      502,
    );
  }

  // Conversion event, attributed to the A/B variant the visitor was served.
  track({
    event: "lead_submitted",
    experiment: FORM_EXPERIMENT,
    variant: typeof body.variant === "string" ? body.variant : "unknown",
    leadId: post.leadId,
    price: ping.price,
  });

  return json({ ok: true, price: ping.price, leadId: post.leadId });
};
