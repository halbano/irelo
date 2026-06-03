// mock-ping-post.mjs — run: node mock-ping-post.mjs
// A dependency-free stand-in for the iRelo lead-distribution (ping-post) backend.
// Listens on http://localhost:9000. Deterministic, so you can trigger every outcome:
//   - vehicleType "boat" on /ping        -> rejected (no buyers)
//   - email containing "dupe" on /post   -> duplicate (409)
//   - email containing "slow" on /post   -> 10s delay (test your timeout handling)
//   - anything else                      -> accepted with a price / confirmed with a leadId
import { createServer } from "node:http";

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
  });

createServer(async (req, res) => {
  const body = await readBody(req);

  // PING: partial lead in, accept + price + pingId, or reject
  if (req.url === "/ping" && req.method === "POST") {
    if (!body.originZip || !body.destinationZip || !body.vehicleType) {
      return json(res, 400, { error: "missing required ping fields" });
    }
    if (body.vehicleType === "boat") {
      return json(res, 200, { accepted: false, reason: "no_buyers" });
    }
    const price = 35 + Math.floor(Math.random() * 40); // $35–$74 per lead
    return json(res, 200, { accepted: true, price, pingId: "ping_" + Date.now() });
  }

  // POST: full lead + pingId in, confirm leadId, or duplicate, or hang
  if (req.url === "/post" && req.method === "POST") {
    if (!body.pingId) return json(res, 400, { error: "missing pingId" });
    const email = String(body.email || "");
    if (email.includes("slow")) {
      setTimeout(() => json(res, 200, { confirmed: true, leadId: "lead_late" }), 10000);
      return;
    }
    if (email.includes("dupe")) {
      return json(res, 409, { confirmed: false, reason: "duplicate" });
    }
    return json(res, 200, { confirmed: true, leadId: "lead_" + Date.now() });
  }

  json(res, 404, { error: "not found" });
}).listen(9000, () => console.log("mock ping-post on http://localhost:9000"));
