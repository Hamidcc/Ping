export async function handler(event, context) {
  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) return { statusCode: 400, body: "Missing URL" };

  try {
    // Fetch the target URL
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": event.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const contentType = res.headers.get("content-type") || "text/html";

    // If HTML, rewrite URLs
    if (contentType.includes("text/html")) {
      let body = await res.text();
      const urlObj = new URL(targetUrl);
      const base = urlObj.origin;

      // Rewrite absolute and relative paths
      // 1. src, href, action starting with /
      body = body.replace(
        /(src|href|action)=["'](\/[^"']*)["']/gi,
        (match, attr, path) => `${attr}="/.netlify/functions/proxy?url=${encodeURIComponent(base + path)}"`
      );

      // 2. src, href without leading /
      body = body.replace(
        /(src|href|action)=["']([^"':?#][^"']*)["']/gi,
        (match, attr, path) => `${attr}="/.netlify/functions/proxy?url=${encodeURIComponent(base + "/" + path)}"`
      );

      return {
        statusCode: 200,
        headers: { "Content-Type": contentType },
        body
      };
    }

    // If binary (images, CSS, JS), return as buffer
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": contentType },
      body: buffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    return { statusCode: 500, body: "Proxy fetch failed: " + err.message };
  }
}
