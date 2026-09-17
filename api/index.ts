import app from "../server";

// Vercel Serverless Function entrypoint
export default function handler(req: any, res: any) {
  // Normalize Vercel rewritten paths if needed
  if (req.headers && req.headers["x-matched-path"]) {
    const matched = req.headers["x-matched-path"];
    if (typeof matched === "string" && matched.startsWith("/api/")) {
      req.url = matched;
    }
  }
  return app(req, res);
}
