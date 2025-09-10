export async function handler(event, context) {
  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) return { statusCode: 400, body: "Missing URL" };

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": event.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const contentType = res.headers.get("content-type") || "text/html";

    // If HTML, rewrite relative URLs
    if (contentType.includes("text/html")) {
      let body = await res.text();
      const urlObj = new URL(targetUrl);
      const base = urlObj.origin;

      // Rewrite absolute and relative URLs for src, href, action
      body = body.replace(
        /(src|href|action)=["'](\/[^"']*)["']/gi,
        (match, attr, path) => `${attr}="/.netlify/functions/proxy?url=${encodeURIComponent(base + path)}"`
      );

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

    // For binary data (images, JS, CSS), return base64
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
