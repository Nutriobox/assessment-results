// Vercel serverless function: returns assessment submissions from Supabase.
// The Supabase key lives ONLY here (as an environment variable), never in the browser.
// Env vars to set in the Vercel project:
//   SUPABASE_URL           = https://lezcgmnmcpgbecqtuqsg.supabase.co
//   SUPABASE_SERVICE_KEY   = <your rotated service_role key>
//   SUPABASE_TABLE         = assessment_submissions   (optional; this is the default)
//   DASH_TOKEN             = <optional access code>   (only if you are NOT using Vercel Password Protection)
module.exports = async (req, res) => {
  const base  = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key   = process.env.SUPABASE_SERVICE_KEY || "";
  const table = process.env.SUPABASE_TABLE || "assessment_submissions";
  const tok   = process.env.DASH_TOKEN || "";
  if (tok && (req.headers["x-access"] || "") !== tok) { res.status(401).json({ error: "unauthorized" }); return; }
  if (!base || !key) { res.status(500).json({ error: "Server not configured: set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel environment variables." }); return; }
  try {
    const r = await fetch(base + "/rest/v1/" + table + "?select=*&order=created_at.desc",
      { headers: { apikey: key, Authorization: "Bearer " + key } });
    const text = await r.text();
    if (!r.ok) { res.status(502).json({ error: "Supabase HTTP " + r.status }); return; }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(text);
  } catch (e) { res.status(502).json({ error: String((e && e.message) || e) }); }
};
